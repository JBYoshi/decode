import { BytesNode } from "../nodes/bytes";
import { FormatNode } from "../nodes/format";
import { StringNode } from "../nodes/string";
import { DecodeNode } from "../types";

let utf8decoder = new TextDecoder(undefined, {
    fatal: true,
});

export default function decodeUTF8(a: DecodeNode): DecodeNode | null {
    if (!(a instanceof BytesNode)) return null;
    try {
        return new FormatNode("UTF-8", new StringNode(utf8decoder.decode(a.value)));
    } catch (e) {
        return null;
    }
}
