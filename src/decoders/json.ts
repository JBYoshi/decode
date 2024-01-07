import { DecodeNode, DecodeValue } from "../types";

function representTree(key: string | number | undefined, value: any): DecodeNode {
    if (Array.isArray(value)) {
        return {
            description: "JSON array (" + value.length + " elements)",
            value: JSON.stringify(value),
            children: value.map((element, index) => representTree(index, element))
        };
    }
    if (typeof value == "object") {
        return {
            description: "JSON object (" + Object.keys(value).length + " entries)",
            value: JSON.stringify(value),
            children: Object.keys(value).map(key => representTree(key, value[key]))
        };
    }
    return {
        description: "JSON " + typeof value,
        value
    };
}

export default function decodeJSON(s: DecodeValue): DecodeNode | null {
    if (typeof s != "string") return null;

    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        try {
            return representTree(undefined, JSON.parse(s));
        } catch (e) {
            return null;
        }
    }
    return null;
}
