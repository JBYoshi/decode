import { DecodeNode, DecodeValue } from "../types";

function representTree(title: string | undefined, value: any): DecodeNode {
    if (Array.isArray(value)) {
        return {
            title,
            value: "Array (" + value.length + " elements)",
            children: value.map(element => representTree(undefined, element))
        };
    }
    if (typeof value == "object") {
        return {
            title,
            value: "Object (" + Object.keys(value).length + " entries)",
            children: Object.keys(value).map(key => representTree(key, value[key]))
        };
    }
    return {
        title,
        value
    };
}

export default function decodeJSON(s: DecodeValue): DecodeNode | null {
    if (typeof s != "string") return null;

    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        try {
            return representTree("JSON", JSON.parse(s));
        } catch (e) {
            return null;
        }
    }
    return null;
}
