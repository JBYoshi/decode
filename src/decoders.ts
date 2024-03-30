import { decodeUnixTimestamp } from "./decoders/unix-timestamp";
import decodeJSON from "./decoders/json";
import decodeStringToBytes from "./decoders/str-to-bytes";
import decodeURLLike from "./decoders/url";
import decodeUTF8 from "./decoders/utf8";
import decodeUUID from "./decoders/uuid";
import decodeJOSELike from "./decoders/jose-like";
import decodeCBOR from "./decoders/cbor";
import { Decoder, DecodeNode } from "./types";
import { decodeASN1 } from "./decoders/asn1";
import { decodeXMLEntities } from "./decoders/xml";

const decoders: Decoder[] = [
    decodeURLLike,
    decodeUUID,
    decodeStringToBytes,
    decodeJSON,
    decodeUTF8,
    decodeUnixTimestamp,
    decodeJOSELike,
    decodeCBOR,
    decodeASN1,
    decodeXMLEntities
];

export default function decode(input: DecodeNode): DecodeNode[] {
    return decoders.map(decoder => decoder(input)).filter(x => x != null) as DecodeNode[];
}
