import { decodeXMLEntities } from "../../src/decoders/xml";
import { StringNode } from "../../src/nodes/string";

describe("XML entity decoder", function() {
    it("decodes XML entities", function() {
        expect(decodeXMLEntities(new StringNode("&lt;&gt;&quot;&amp;&apos;&#x1F3C0;")))
            .toEqual(new StringNode("<>\"&'🏀").setDecodeRoot("XML Entity Decode"));
    });
    it("does not double-decode", function() {
        expect(decodeXMLEntities(new StringNode("&amp;amp;").setDecodeRoot("XML Entity Decode")))
            .toEqual(new StringNode("&amp;").setDecodeRoot("XML Entity Decode"));
    });
});
