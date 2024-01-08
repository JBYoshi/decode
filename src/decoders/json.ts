import { ConstantNode } from "../nodes/constant";
import { FormatNode } from "../nodes/format";
import { KeyValueNode } from "../nodes/keyvalue";
import { ListNode } from "../nodes/list";
import { NumberNode } from "../nodes/number";
import { StringNode } from "../nodes/string";
import { DecodeNode } from "../types";

function representTree(value: any): DecodeNode {
    if (Array.isArray(value)) {
        return new ListNode("Array", [{format: "JSON", value: JSON.stringify(value)}],
            value.map((element) => representTree(element)));
    }
    if (value === null) {
        return ConstantNode.NULL;
    }
    if (typeof value == "object") {
        return new ListNode("Object", [{format: "JSON", value: JSON.stringify(value)}],
            Object.keys(value).map(key => new KeyValueNode(new StringNode(key), representTree(value[key]))));
    }
    if (typeof value == "string") {
        return new StringNode(value);
    }
    if (typeof value == "number") {
        return new NumberNode(value);
    }
    if (typeof value == "boolean") {
        return ConstantNode.fromBoolean(value);
    }
    // TODO: fallback case?
}

export default function decodeJSON(node: DecodeNode): DecodeNode | null {
    if (!(node instanceof StringNode)) return null;

    let s = node.value;

    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        let json;
        try {
            json = JSON.parse(s);
        } catch (e) {
            return null;
        }
        return new FormatNode("JSON", representTree(json));
    }
    return null;
}
