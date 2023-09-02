import { decodeBase64URL } from "./str-to-bytes.mjs";

let utf8decoder = new TextDecoder(undefined, {
    fatal: true,
});

export default function decodeJOSELike(input) {
    if (typeof input == "string" && input.match(/[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+/g)) {
        let parts = input.split(".");
        try {
            parts = parts.map(decodeBase64URL);
        } catch (e) {
            return null;
        }
        // Try to parse the header to get a better title.

        let header = null;
        try {
            header = JSON.parse(utf8decoder.decode(new Uint8Array(parts[0])));
        } catch (ignore) {}

        if (typeof header == "object" && header?.typ == "JWT" && parts.length == 3) {
            try {
                return {
                    title: "JWT",
                    value: input,
                    children: [
                        {
                            title: "Header",
                            value: utf8decoder.decode(new Uint8Array(parts[0]))
                        },
                        {
                            title: "Payload",
                            value: utf8decoder.decode(new Uint8Array(parts[1]))
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