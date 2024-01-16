import { AsnType, BaseStringBlock, BitString, Boolean, Choice, Constructed, EndOfContent, Integer, Null, ObjectIdentifier, OctetString, RelativeObjectIdentifier, fromBER } from "asn1js";
import { BytesNode } from "../nodes/bytes";
import { DecodeNode } from "../types";
import { ConstantNode } from "../nodes/constant";
import { NumberNode } from "../nodes/number";
import { ListNode } from "../nodes/list";
import { StringNode } from "../nodes/string";

function toNode(data: AsnType): DecodeNode {
    if (data instanceof Boolean) {
        return ConstantNode.fromBoolean(data.getValue());
    } else if (data instanceof Null) {
        return ConstantNode.NULL;
    } else if (data instanceof EndOfContent) {
        return new ConstantNode("End of Content");
    } else if (data instanceof Integer) {
        return new NumberNode(data.toBigInt()).setType("Integer");
    } else if (data instanceof ObjectIdentifier) {
        return new ConstantNode("Object Identifier", data.getValue());
    } else if (data instanceof RelativeObjectIdentifier) {
        return new ConstantNode("Relative Object Identifier", data.getValue());
    } else if (data instanceof Constructed) {
        return new ListNode(data.name,
            data.valueBlock.value.map(block => toNode(block))
        );
    } else if (data instanceof Choice) {
        return new ListNode("Choice",
            data.value.map(block => toNode(block))
        );
    } else if (data instanceof OctetString) {
        return new BytesNode(new Uint8Array(data.getValue()));
    } else if (data instanceof BitString) {
        // Bits, not bytes; can't do very much here.
        // There's no convenient decode function so I'll use this as a workaround.
        return new BitsNode(data.toString("ascii").split(" : ")[1]);
    } else if (data instanceof BaseStringBlock) {
        return new StringNode(data.getValue(), data.name);
    } else {
        return new ConstantNode(data.name, "TODO");
    }
}

class BitsNode extends DecodeNode {
    readonly bitstring: string;

    constructor(bitstring: string) {
        super();
        this.bitstring = bitstring;
    }

    get defaultType() {
        return "Bit string";
    }

    get description() {
        return this.bitstring.replace(/ /g, "").length + " bits";
    }

    get defaultRepresentations() {
        return [
            {format: "Binary", value: this.bitstring}
        ];
    }
}

export function decodeASN1(node: DecodeNode): DecodeNode | null {
    if (!(node instanceof BytesNode)) return null;

    try {
        let data = fromBER(node.value);
        if (data.result.error || data.result.blockLength != node.value.length) return null;
        return toNode(data.result).setDecodeRoot("ASN.1");
    } catch (e) {
        console.warn(e);
        return null;
    }
    
}