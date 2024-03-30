import { StringNode } from "../nodes/string";
import { DecodeNode } from "../types";

import { decode as decodeEntities } from "html-entities"

export function decodeXMLEntities(node: DecodeNode): DecodeNode | null {
    if (node instanceof StringNode) {
        let value = node.value;

        if (!value.includes("&") || !value.includes(";")) return null;

        let decoded = decodeEntities(value);
        if (decoded != value) {
            return new StringNode(decoded).setDecodeRoot("XML Entity Decode");
        }
    }
    return null;
}
