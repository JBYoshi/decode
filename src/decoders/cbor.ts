import { decodeAllSync } from "cbor-web";
import { DecodeNode, DecodeValue } from "../types";

function representTree(key: string | number | undefined, value: any): DecodeNode {
    if (Array.isArray(value)) {
        return {
            key,
            description: "CBOR array (" + value.length + " elements)",
            value: null, // TODO
            children: value.map((element, index) => representTree(index, element))
        };
    }
    if (value instanceof Map) {
        return {
            description: "CBOR map (" + [...value.keys()].length + " entries)",
            value: null, // TODO
            children: [...value.keys()].map(key => representTree(key, value.get(key)))
        };
    }
    if (Object.getPrototypeOf(value) == Object.prototype) {
        return {
            description: "CBOR map (" + Object.keys(value).length + " entries)",
            value: null, // TODO
            children: Object.keys(value).map(key => representTree(key, value[key]))
        };
    }
    return {
        description: "CBOR " + (typeof value == "object" && value ? value.constructor.name : typeof value),
        value
    };
}

export default function decodeCBOR(input: DecodeValue): DecodeNode | null {
    if (!(input instanceof Uint8Array)) {
        return null;
    }
    try {
        let entries = decodeAllSync(input);
        if (entries.length == 1) {
            return representTree(undefined, entries[0]);
        } else {
            return representTree(undefined, entries);
        }
    } catch (e) {
        console.warn(e);
        return null;
    }
}
