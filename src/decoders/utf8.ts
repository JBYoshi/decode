import { BytesNode } from "../nodes/bytes";
import { StringNode } from "../nodes/string";
import { DecodeNode } from "../types";

let utf8decoder = new TextDecoder(undefined, {
    fatal: true,
});

export default function decodeUTF8(a: DecodeNode): DecodeNode | null {
    if (!(a instanceof BytesNode)) return null;
    try {
        return new StringNode(utf8decoder.decode(a.value)).setDecodeRoot("UTF-8");
    } catch (e) {
        return null;
    }
}
