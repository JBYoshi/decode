import { decodeAllSync } from "cbor-web";
import { DecodeNode } from "../types";
import { ListNode } from "../nodes/list";
import { KeyValueNode } from "../nodes/keyvalue";
import { StringNode } from "../nodes/string";
import { BytesNode } from "../nodes/bytes";
import { DateNode } from "../nodes/date";
import { NumberNode } from "../nodes/number";
import { ConstantNode } from "../nodes/constant";
import { FormatNode } from "../nodes/format";

function representTree(value: any): DecodeNode {
    if (Array.isArray(value)) {
        return new ListNode("Array", [ /* TODO */ ], value.map(element => representTree(element)));
    }
    if (value instanceof Map) {
        return new ListNode("Map", [ /* TODO */ ], [...value.entries()].map(([key, value]) => new KeyValueNode(representTree(key), representTree(value))));
    }
    if (Object.getPrototypeOf(value) == Object.prototype) {
        return new ListNode("Map", [ /* TODO */ ], [...Object.keys(value)].map(key => new KeyValueNode(representTree(key), representTree(value[key]))));
    }
    if (typeof value == "string") {
        return new StringNode(value);
    }
    if (value instanceof Uint8Array) {
        return new BytesNode(value);
    }
    if (value instanceof Date) {
        return new DateNode(value);
    }
    if (typeof value == "number" || typeof value == "bigint") {
        return new NumberNode(value);
    }
    // TODO
    return new ConstantNode("" + value, typeof value);
}

export default function decodeCBOR(input: DecodeNode): DecodeNode | null {
    if (!(input instanceof BytesNode)) {
        return null;
    }
    try {
        let entries = decodeAllSync(input.value);
        if (entries.length == 1) {
            return new FormatNode("CBOR", representTree(entries[0]));
        } else {
            return new FormatNode("CBOR", new ListNode("Stream", [ /* TODO */ ], entries.map(entry => representTree(entry))));
        }
    } catch (e) {
        console.warn(e);
        return null;
    }
}
