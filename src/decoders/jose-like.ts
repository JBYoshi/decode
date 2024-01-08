import { BytesNode } from "../nodes/bytes";
import { ListNode } from "../nodes/list";
import { ObjectNode } from "../nodes/object";
import { StringNode } from "../nodes/string";
import { DecodeNode } from "../types";
import { decodeBase64URL } from "./str-to-bytes.js";

let utf8decoder = new TextDecoder(undefined, {
    fatal: true,
});

export default function decodeJOSELike(input: DecodeNode): DecodeNode | null {
    if (input instanceof StringNode && input.value.match(/[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+/g)) {
        let partsStr = input.value.split(".");
        let parts: Uint8Array[];
        try {
            parts = partsStr.map(decodeBase64URL);
        } catch (e) {
            return null;
        }
        // Try to parse the header to get a better title.

        let header: any = null;
        try {
            header = JSON.parse(utf8decoder.decode(parts[0]));
        } catch (ignore) {}

        if (typeof header == "object" && header?.typ == "JWT" && partsStr.length == 3) {
            try {
                return new ObjectNode("JWT", input.value, [
                    {
                        description: "Header",
                        value: new StringNode(utf8decoder.decode(parts[0]))
                    },
                    {
                        description: "Payload",
                        value: new StringNode(utf8decoder.decode(parts[1]))
                    },
                    {
                        description: "Signature",
                        value: new BytesNode(parts[2])
                    }
                ]);
            } catch (ignore) {}
        }

        return new ListNode("JOSE-like token", [{format: "Token", value: input.value}],
            parts.map(part => new BytesNode(part)));
    }
    return null;
}