import decodeURLLike from "../../src/decoders/url";
import { ConstantNode } from "../../src/nodes/constant";
import { KeyValueNode } from "../../src/nodes/keyvalue";
import { ListNode } from "../../src/nodes/list";
import { NumberNode } from "../../src/nodes/number";
import { ObjectNode } from "../../src/nodes/object";
import { StringNode } from "../../src/nodes/string";

describe("URL decoder", function() {
    it("decodes a URL correctly", function() {
        let url = "https://foo:bar@example.com:8080/a/b/c?q1=2&q3=4#hash";
        let decoded = decodeURLLike(new StringNode(url));
        expect(decoded).toEqual(new ObjectNode("URL", [
            {description: "Protocol", value: new ConstantNode("Protocol", "https:")},
            {description: "Username", value: new StringNode("foo")},
            {description: "Password", value: new StringNode("bar")},
            {description: "Hostname", value: new StringNode("example.com")},
            {description: "Port", value: new NumberNode(8080)},
            {description: "Path", value: new ListNode("Path string", [
                new StringNode("a"),
                new StringNode("b"),
                new StringNode("c")
            ]).addRepresentation("Path string", "/a/b/c").setChildrenSignificant(false)},
            {description: "Query", value: new ListNode("Query string", [
                new KeyValueNode(new StringNode("q1"), new StringNode("2")),
                new KeyValueNode(new StringNode("q3"), new StringNode("4"))
            ]).addRepresentation("Query string", "q1=2&q3=4").setChildrenSignificant(false)},
            {description: "Hash", value: new StringNode("hash")}
        ]).addRepresentation("URL", url));
    });

    it("decodes components within a URL correctly", function() {
        let url = "http://%61:%62@%63/%64?%65=%66#%67";
        let decoded = decodeURLLike(new StringNode(url));
        expect(decoded).toEqual(new ObjectNode("URL", [
            {description: "Protocol", value: new ConstantNode("Protocol", "http:")},
            {description: "Username", value: new StringNode("%61")}, // TODO
            {description: "Password", value: new StringNode("%62")}, // TODO
            {description: "Hostname", value: new StringNode("c")},
            {description: "Path", value: new ListNode("Path string", [
                new StringNode("d")
            ]).addRepresentation("Path string", "/%64")},
            {description: "Query", value: new ListNode("Query string", [
                new KeyValueNode(new StringNode("e"), new StringNode("f"))
            ]).addRepresentation("Query string", "%65=%66")},
            {description: "Hash", value: new StringNode("%67")} // TODO
        ]).addRepresentation("URL", url.replace("%63", "c")).setChildrenSignificant(true)); // TODO
    });

    it("decodes bare components correctly", function() {
        let url = "%61%62%63";
        let decoded = decodeURLLike(new StringNode(url));
        expect(decoded).toEqual(new StringNode("abc").setDecodeRoot("URL Component"));
    });

    it("ignores junk data", function() {
        expect(decodeURLLike(new StringNode("asdf"))).toBeNull();
    });
});
