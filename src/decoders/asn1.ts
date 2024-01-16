import { AsnType, BaseStringBlock, BitString, BmpString, Boolean, CharacterString, Choice, Constructed, DATE, DateTime, Duration, EndOfContent, GeneralString, GeneralizedTime, GraphicString, IA5String, Integer, Null, NumericString, ObjectIdentifier, OctetString, PrintableString, RelativeObjectIdentifier, Sequence, TIME, TeletexString, TimeOfDay, UTCTime, UniversalString, Utf8String, VideotexString, VisibleString, fromBER } from "asn1js";
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
        let name = "";
        if (data instanceof Sequence) {
            name = "Sequence";
        } else if (data instanceof Set) {
            name = "Set";
        }
        return new ListNode(name,
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
        return new BitsNode(getBitsFromBitString(data));
    } else if (data instanceof BaseStringBlock) {
        let name = "";
        if (data instanceof TIME) {
            name = "Time";
        } else if (data instanceof DATE) {
            name = "Date";
        } else if (data instanceof DateTime) {
            name = "Date/Time";
        } else if (data instanceof TimeOfDay) {
            name = "Time of Day";
        } else if (data instanceof Duration) {
            name = "Duration";
        } else if (data instanceof Utf8String) {
            name = "UTF-8 String";
        } else if (data instanceof NumericString) {
            name = "Numeric String";
        } else if (data instanceof PrintableString) {
            name = "Printable String";
        } else if (data instanceof TeletexString) {
            name = "Teletex String";
        } else if (data instanceof VideotexString) {
            name = "Videotex String";
        } else if (data instanceof IA5String) {
            name = "IA5 String";
        } else if (data instanceof GeneralizedTime) {
            name = "Generalized Time";
        } else if (data instanceof UTCTime) {
            name = "UTC Time";
        } else if (data instanceof GraphicString) {
            name = "Graphic String";
        } else if (data instanceof VisibleString) {
            name = "Visible String";
        } else if (data instanceof GeneralString) {
            name = "General String";
        } else if (data instanceof UniversalString) {
            name = "Teletex String";
        } else if (data instanceof CharacterString) {
            name = "Character String";
        } else if (data instanceof BmpString) {
            name = "BMP String";
        }
        return new StringNode(data.getValue(), name);
    } else {
        return new ConstantNode("Unknown", "TODO");
    }
}

function getBitsFromBitString(data: BitString): string {
    if (data.valueBlock.isConstructed) {
        let bits = "";
        for (let block of data.valueBlock.value) {
            if (!(block instanceof BitString)) {
                throw new TypeError("Constructed bit string must contain only bit strings");
            }
            if (block.valueBlock.isConstructed) {
                throw new TypeError("Constructed bit string must not contain other constructed bit strings");
            }
            bits += getBitsFromBitString(block as BitString);
        }
        return bits;
    }
    // Copied from the asn1js toString() implementation.
    const bits = [];
    const valueHex = data.valueBlock.valueHexView;
    for (const byte of valueHex) {
        bits.push(byte.toString(2).padStart(8, "0"));
    }
    const bitsStr = bits.join("");
    return bitsStr.slice(0, bitsStr.length - data.valueBlock.unusedBits);
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