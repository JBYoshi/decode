import { ConstantNode } from "../nodes/constant";
import { KeyValueNode } from "../nodes/keyvalue";
import { ListNode } from "../nodes/list";
import { NumberNode } from "../nodes/number";
import { ObjectNode, Property } from "../nodes/object";
import { StringNode } from "../nodes/string";
import { DecodeNode } from "../types";

export default function decodeURLLike(input: DecodeNode): DecodeNode | null {
    if (!(input instanceof StringNode)) return null;

    // For this, I am specifying "only characters that are not allowed in any of the URL control sets."
    // In the URL spec (https://url.spec.whatwg.org), this reduces to excluding characters in the fragment percent-encode set
    // and the query percent-encode set. Everything else is derived from these with other characters blocked.
    if (input.value.match(/^([!$#$&-;=?-~]|%[0-9a-fA-F]{2})+$/) && input.value.includes("://")) {
        let url: URL | null = null;
        try {
            url = new URL(input.value);
        } catch (e) {}
        if (url != null) {
            let parts: Property[] = [];
            
            if (url.protocol) {
                parts.push({
                    description: "Protocol",
                    value: new ConstantNode("Protocol", url.protocol)
                });
            }
            if (url.username) {
                parts.push({
                    description: "Username",
                    value: new StringNode(url.username)
                });
            }
            if (url.password) {
                parts.push({
                    description: "Password",
                    value: new StringNode(url.password)
                });
            }
            if (url.hostname) {
                parts.push({
                    description: "Hostname",
                    value: new StringNode(url.hostname)
                });
            }
            if (url.port) {
                parts.push({
                    description: "Port",
                    value: new NumberNode(parseInt(url.port))
                });
            }
            if (url.pathname) {
                parts.push({
                    description: "Path",
                    value: new ListNode(
                        "Path string",
                        url.pathname.replace(/^\//, "").split("/").map(element => new StringNode(decodeURIComponent(element)))
                    ).addRepresentation("Path string", url.pathname)
                });
            }
            if (url.search) {
                parts.push({
                    description: "Query",
                    value: new ListNode(
                        "Query string",
                        [...url.searchParams.entries()]
                            .map(([key, value]) => new KeyValueNode(new StringNode(key), new StringNode(value)))
                    ).addRepresentation("Query string", url.search.substring(1))
                });
            }
            if (url.hash) {
                parts.push({
                    description: "Hash",
                    value: new StringNode(url.hash.substring(1))
                });
            }

            return new ObjectNode("URL", parts).addRepresentation("URL", url.toString());
        }
    }

    if (input.value.includes("%")) {
        return new StringNode(decodeURIComponent(input.value)).setDecodeRoot("URL Component");
    }
    return null;
}