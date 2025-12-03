import {decodeASN1} from "../../src/decoders/asn1";
import {BytesNode} from "../../src/nodes/bytes";
import {decodeBase64} from "../../src/decoders/str-to-bytes";
import {DateNode} from "../../src/nodes/date";

describe("ASN1 decoder", () => {
    it("decodes dates correctly", () => {
        let date = decodeASN1(new BytesNode(decodeBase64("Fw0yNjEwMjAxNDM0MzJa")));
        expect(date).toEqual(new DateNode(new Date(1792506872000)).setType("UTC Time").setDecodeRoot("ASN.1 BER"));
    });
});
