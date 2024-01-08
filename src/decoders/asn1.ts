import { AsnType, BaseBlock, BaseStringBlock, BitString, Boolean, Choice, Constructed, EndOfContent, HexBlock, Integer, Null, ObjectIdentifier, OctetString, RelativeObjectIdentifier, Sequence, fromBER } from "asn1js";
import { BytesNode } from "../nodes/bytes";
import { DecodeNode, Representation } from "../types";
import { ConstantNode } from "../nodes/constant";
import { NumberNode } from "../nodes/number";
import { FormatNode } from "../nodes/format";
import { ListNode } from "../nodes/list";
import { StringNode } from "../nodes/string";

function toNode(data: AsnType): DecodeNode {
    if (data instanceof Boolean) {
        return ConstantNode.fromBoolean(data.getValue());
    } else if (data instanceof Null) {
        return ConstantNode.NULL;
    } else if (data instanceof EndOfContent) {
        return new ConstantNode("End of Content");
    } else if (data instanceof Integer) {
        return new NumberNode(data.toBigInt(), "Integer");
    } else if (data instanceof ObjectIdentifier) {
        return new ConstantNode("Object Identifier", data.getValue());
    } else if (data instanceof RelativeObjectIdentifier) {
        return new ConstantNode("Relative Object Identifier", data.getValue());
    } else if (data instanceof Constructed) {
        return new ListNode(data.constructor.name, [ /* TODO */ ],
            data.valueBlock.value.map(block => toNode(block))
        );
    } else if (data instanceof Choice) {
        return new ListNode("Choice", [ /* TODO */ ],
            data.value.map(block => toNode(block))
        );
    } else if (data instanceof OctetString) {
        return new BytesNode(new Uint8Array(data.getValue()));
    } else if (data instanceof BitString) {
        // Bits, not bytes; can't do very much here.
        // There's no convenient decode function so I'll use this as a workaround.
        return new BitsNode(data.toString("ascii").split(" : ")[1]);
    } else if (data instanceof BaseStringBlock) {
        return new StringNode(data.getValue(), data.constructor.name);
    } else {
        return new ConstantNode(data.constructor.name, "TODO");
    }
}

class BitsNode implements DecodeNode {
    readonly bitstring: string;

    constructor(bitstring: string) {
        this.bitstring = bitstring;
    }

    get description() {
        return "Bit string";
    }

    get representations() {
        return [
            {format: "Binary", value: this.bitstring}
        ];
    }
}

export function decodeASN1(node: DecodeNode): DecodeNode | null {
    if (!(node instanceof BytesNode)) return null;

    try {
        let data = fromBER(node.value);
        if (data.result.error || data.result.blockLength != node.value.length) return null;
        return new FormatNode("ASN.1", toNode(data.result));
    } catch (e) {
        console.warn(e);
        return null;
    }
    
}