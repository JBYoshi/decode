import { DecodeNode, DecodeValue } from "../types";

let utf8decoder = new TextDecoder(undefined, {
    fatal: true,
});

export default function decodeUTF8(a: DecodeValue): DecodeNode | null {
    if (!(a instanceof Uint8Array)) return null;
    try {
        return {
            title: "UTF-8",
            value: utf8decoder.decode(new Uint8Array(a))
        };
    } catch (e) {
        return null;
    }
}
