import { Float16Array } from "@petamoriken/float16";
import { BytesNode } from "../nodes/bytes";
import { ConstantNode } from "../nodes/constant";
import { FormatNode } from "../nodes/format";
import { KeyValueNode } from "../nodes/keyvalue";
import { ListNode } from "../nodes/list";
import { NumberNode } from "../nodes/number";
import { StringNode } from "../nodes/string";
import { DecodeNode } from "../types";

class ByteReader {
    readonly buf: Uint8Array;
    private pos_: number = 0;

    constructor(buf: Uint8Array) {
        this.buf = buf;
    }

    get eof() {
        return this.pos >= this.buf.length;
    }

    get pos() {
        return this.pos_;
    }

    takeOne(): number {
        return this.take(1)[0];
    }

    take(count: number) {
        if (this.pos + count > this.buf.length) {
            throw new RangeError("End of stream: tried to take " + count + " bytes when " + (this.buf.length - this.pos) + " bytes were remaining");
        }
        let slice = this.buf.slice(this.pos, this.pos + count);
        this.pos_ += count;
        return slice;
    }
}

const BREAK_NODE = new ConstantNode(0xFF, "CBOR Break");

interface CBORNode {
    debugDescription: string;
    node: DecodeNode;
    start: number;
    end: number;
}

type BreakStatus = "NO_BREAK" | "STRING" | "LIST";

// I decided to implement my own CBOR decoder because the existing JavaScript ones couldn't represent
// the diagnostic format hierarchically.
function decodeNode(reader: ByteReader, waitingForBreak: BreakStatus = "NO_BREAK"): CBORNode {
    let start = reader.pos;

    let typeCode = reader.takeOne();

    let type = typeCode >> 5;
    let arg: bigint = BigInt(typeCode & 0x1f);
    let indefinite = false;

    let originalArg = arg;
    if (arg == 24n) {
        arg = BigInt(reader.takeOne());
    } else if (arg == 25n) {
        arg = BigInt(new Uint16Array(reader.take(2).reverse().buffer)[0]);
    } else if (arg == 26n) {
        arg = BigInt(new Uint32Array(reader.take(4).reverse().buffer)[0]);
    } else if (arg == 27n) {
        arg = new BigUint64Array(reader.take(8).reverse().buffer)[0];
    } else if (arg >= 28n && arg <= 30n) {
        throw new TypeError("Invalid CBOR: invalid argument value " + arg);
    } else if (arg == 31n) {
        indefinite = true;
        if (waitingForBreak != "NO_BREAK") {
            if (type == 7) {
                // This is a break code
                return {node: BREAK_NODE, debugDescription: "break", start, end: reader.pos};
            } else if (waitingForBreak == "STRING") {
                // Not a break code; reject
                throw new TypeError("Invalid CBOR: indefinite length not allowed here");
            }
        }
    }

    if (type == 0) { // Unsigned integer
        if (indefinite) {
            throw new TypeError("Invalid CBOR: got indefinite length for integer");
        }
        return {node: new NumberNode(arg, "Integer"), debugDescription: arg.toString(), start, end: reader.pos};
    } else if (type == 1) { // Negative integer
        if (indefinite) {
            throw new TypeError("Invalid CBOR: got indefinite length for integer");
        }
        let val = -arg - 1n;
        return {node: new NumberNode(val, "Integer"), debugDescription: val.toString(), start, end: reader.pos};
    } else if (type == 2) { // Byte string
        let value: Uint8Array;
        let debugDescription: string;
        if (indefinite) {
            let subValues: number[] = [];
            let subDebugs: string[] = [];
            while (true) {
                let child = decodeNode(reader, "STRING");
                if (child.node == BREAK_NODE) {
                    break;
                } else if (!(child.node instanceof BytesNode)) {
                    throw new TypeError("Invalid CBOR: expected byte string within indefinite byte string");
                } else {
                    subValues.push(...(child.node.value as Uint8Array));
                    subDebugs.push(child.debugDescription);
                }
            }
            value = new Uint8Array(subValues);
            debugDescription = "(_ " + subDebugs.join(", ") + ")";
            if (subDebugs.length == 0) {
                debugDescription = "''_";
            }
        } else {
            value = reader.take(Number(arg));
            debugDescription = "h'" + BytesNode.toHex(value, "") + "'";
        }
        return {node: new BytesNode(value), debugDescription, start, end: reader.pos};
    } else if (type == 3) { // Text string
        let value: string;
        let debugDescription: string;
        if (indefinite) {
            value = "";
            let subDebugs = [];
            while (true) {
                let child = decodeNode(reader, "STRING");
                if (child.node == BREAK_NODE) {
                    break;
                } else if (!(child.node instanceof StringNode)) {
                    throw new TypeError("Invalid CBOR: expected text string within indefinite text string");
                } else {
                    value += (child.node.value as string);
                    subDebugs.push(child.debugDescription);
                }
            }
            debugDescription = "(_ " + subDebugs.join(", ") + ")";
            if (subDebugs.length == 0) {
                debugDescription = "\"\"_";
            }
        } else {
            value = new TextDecoder().decode(reader.take(Number(arg)));
            debugDescription = JSON.stringify(value);
        }
        return {node: new StringNode(value), debugDescription, start, end: reader.pos};
    } else if (type == 4) { // Array
        let elements: DecodeNode[] = [];
        let debugs: string[] = [];
        if (indefinite) {
            while (true) {
                let child = decodeNode(reader, "LIST");
                if (child.node == BREAK_NODE) {
                    break;
                } else {
                    elements.push(child.node);
                    debugs.push(child.debugDescription);
                }
            }
        } else {
            for (let i = 0; i < Number(arg); i++) {
                let child = decodeNode(reader);
                elements.push(child.node);
                debugs.push(child.debugDescription);
            }
        }
        let debugDescription = (indefinite ? "[_ " : "[") + debugs.join(", ") + "]";
        return {
            node: new ListNode("Array", [
                {format: "CBOR diagnostic", value: debugDescription},
                ...new BytesNode(reader.buf.slice(start, reader.pos)).representations
            ], elements),
            debugDescription,
            start,
            end: reader.pos
        };
    } else if (type == 5) { // Map
        let elements: DecodeNode[] = [];
        let debugs: string[] = [];
        if (indefinite) {
            while (true) {
                let key = decodeNode(reader, "LIST");
                if (key.node == BREAK_NODE) {
                    break;
                }
                let value = decodeNode(reader);
                elements.push(new KeyValueNode(key.node, value.node));
                debugs.push(key.debugDescription + ": " + value.debugDescription);
            }
        } else {
            for (let i = 0; i < Number(arg); i++) {
                let key = decodeNode(reader);
                let value = decodeNode(reader);
                elements.push(new KeyValueNode(key.node, value.node));
                debugs.push(key.debugDescription + ": " + value.debugDescription);
            }
        }
        let debugDescription = (indefinite ? "{_ " : "{") + debugs.join(", ") + "}";
        return {
            node: new ListNode("Map", [
                {format: "CBOR diagnostic", value: debugDescription},
                ...new BytesNode(reader.buf.slice(start, reader.pos)).representations
            ], elements),
            debugDescription,
            start,
            end: reader.pos
        };
    } else if (type == 6) { // Tag
        if (indefinite) {
            throw new TypeError("Indefinite tag not allowed");
        }
        let content = decodeNode(reader);
        return {
            node: new FormatNode("Tag " + arg, content.node),
            debugDescription: arg + "(" + content.debugDescription + ")",
            start,
            end: reader.pos
        };
    } else if (type == 7) { // Simple
        let node: DecodeNode;
        let debugDescription: string;
        // First check alternate types.
        if (originalArg == 25n) { // 16-bit float
            let array = new ArrayBuffer(2);
            new Uint16Array(array)[0] = Number(arg);
            let value = new Float16Array(array)[0];
            node = new NumberNode(value, "Float16");
            debugDescription = value + "_1";
        } else if (originalArg == 26n) { // 32-bit float
            let array = new ArrayBuffer(4);
            new Uint32Array(array)[0] = Number(arg);
            let value = new Float32Array(array)[0];
            node = new NumberNode(value, "Float32");
            debugDescription = value + "_2";
        } else if (originalArg == 27n) { // 64-bit float
            let array = new ArrayBuffer(8);
            new BigUint64Array(array)[0] = arg;
            let value = new Float64Array(array)[0];
            node = new NumberNode(value, "Float64");
            debugDescription = value + "_3";
        } else if (indefinite) {
            // Break is checked for above
            throw new TypeError("Break not allowed here");
        } else if (originalArg == 20n) {
            node = new ConstantNode(arg, "false");
            debugDescription = "false";
        } else if (originalArg == 21n) {
            node = new ConstantNode(arg, "true");
            debugDescription = "true";
        } else if (originalArg == 22n) {
            node = new ConstantNode(arg, "null");
            debugDescription = "null";
        } else if (originalArg == 23n) {
            node = new ConstantNode(arg, "undefined");
            debugDescription = "undefined";
        } else if (originalArg < 25) {
            if (originalArg == 24n && arg < 32) {
                throw new TypeError("Simple type cannot use extended sequence starting with 24 unless the argument is at least 32");
            }
            node = new ConstantNode("simple(" + arg + ")");
            debugDescription = "simple(" + arg + ")";
        } else {
            throw new TypeError("Unsupported simple type " + originalArg);
        }

        return {node, debugDescription, start, end: reader.pos};
    } else {
        throw new TypeError("Should not get here");
    }
}

export default function decodeCBOR(input: DecodeNode): DecodeNode | null {
    if (!(input instanceof BytesNode)) {
        return null;
    }
    try {
        let reader = new ByteReader(input.value);
        let stream: CBORNode[] = [];
        while (!reader.eof) {
            stream.push(decodeNode(reader));
        }
        if (stream.length == 1) {
            return new FormatNode("CBOR", stream[0].node);
        } else {
            return new FormatNode("CBOR", new ListNode("Stream", [
                {format: "CBOR diagnostic", value: stream.map(item => item.debugDescription).join(", ")}
            ], stream.map(item => item.node)));
        }
    } catch (e) {
        console.warn(e);
        return null;
    }
}
