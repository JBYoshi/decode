import { DecodeNode, DecodeValue } from "../types";
import { decodeBase64URL } from "./str-to-bytes.js";

let utf8decoder = new TextDecoder(undefined, {
    fatal: true,
});

export default function decodeJOSELike(input: DecodeValue): DecodeNode | null {
    if (typeof input == "string" && input.match(/[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+/g)) {
        let partsStr = input.split(".");
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
                return {
                    title: "JWT",
                    value: input,
                    children: [
                        {
                            title: "Header",
                            value: utf8decoder.decode(parts[0])
                        },
                        {
                            title: "Payload",
                            value: utf8decoder.decode(parts[1])
                        },
                        {
                            title: "Signature",
                            value: parts[2]
                        }
                    ]
                };
            } catch (ignore) {}
        }

        return {
            title: "JOSE-like token",
            value: input,
            children: parts.map(part => ({value: part}))
        };
    }
    return null;
}