import decodeJOSELike from "../../src/decoders/jose-like";
import { BytesNode } from "../../src/nodes/bytes";
import { ObjectNode } from "../../src/nodes/object";
import { StringNode } from "../../src/nodes/string";

// From jwt.io
let sampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("JOSE decoder", function() {
    it("decodes a JWT correctly", function() {
        let decoded = decodeJOSELike(new StringNode(sampleToken));
        expect(decoded).toEqual(new ObjectNode("JWT", [
            {description: "Header", value: new StringNode(`{"alg":"HS256","typ":"JWT"}`)},
            {description: "Payload", value: new StringNode(`{"sub":"1234567890","name":"John Doe","iat":1516239022}`)},
            {description: "Signature", value: new BytesNode(new Uint8Array(Buffer.from("SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c", "base64url")))}
        ]).addRepresentation("JWT", sampleToken));
    });

    it("ignores junk data", function() {
        expect(decodeJOSELike(new StringNode("asdf"))).toBeNull();
    })
});
