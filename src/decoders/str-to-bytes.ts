import { BytesNode } from "../nodes/bytes";
import { StringNode } from "../nodes/string";
import { DecodeNode } from "../types";

export function decodeBase64(input: string): Uint8Array {
    let decoded = atob(input);
    let array: number[] = [];
    for (let i = 0; i < decoded.length; i++) {
        array.push(decoded.charCodeAt(i));
    }
    return new Uint8Array(array);
}

export function decodeBase64URL(input: string): Uint8Array {
    let inStandardBase64 = input.replace(/_/g, "/").replace(/-/g, "+");
    while (inStandardBase64.length % 4 != 0) {
        inStandardBase64 += "=";
    }
    return decodeBase64(inStandardBase64);
}

export default function decodeStringToBytes(input: DecodeNode): DecodeNode | null {
    if (!(input instanceof StringNode)) return null;
    
    let text = input.value.replaceAll(/[\s\n]/g, "");

    if (text.match(/^[01]+$/) && text.length % 8 == 0) {
        let result = [];
        for (let i = 0; i < text.length; i += 8) {
            result.push(parseInt(text.slice(i, i + 8), 2));
        }
        return new BytesNode(new Uint8Array(result)).setDecodeRoot("Binary");
    }
    if (text.match(/^[0-9a-fA-F\s]+$/) && text.length % 2 == 0) {
        let result = [];
        for (let i = 0; i < text.length; i += 2) {
            result.push(parseInt(text.slice(i, i + 2), 16));
        }
        return new BytesNode(new Uint8Array(result)).setDecodeRoot("Hex");
    }
    if (text.match(/^[0-9a-zA-Z+/]+={0,2}$/) && text.length % 4 == 0) {
        try {
            return new BytesNode(decodeBase64(text)).setDecodeRoot("Base 64");
        } catch (e) {
            console.warn(e);
        }
    }
    if (text.match(/^[0-9a-zA-Z_-]+$/) && text.length % 4 != 1) {
        try {
            return new BytesNode(decodeBase64URL(text)).setDecodeRoot("URL-safe base 64");
        } catch (e) {
            console.warn(e);
        }
    }
    return null;
}