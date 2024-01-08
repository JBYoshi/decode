import { decodeUnixTimestamp } from "./decoders/unix-timestamp.js";
import decodeJSON from "./decoders/json.js";
import decodeStringToBytes from "./decoders/str-to-bytes.js";
import decodeURLLike from "./decoders/url.js";
import decodeUTF8 from "./decoders/utf8.js";
import decodeUUID from "./decoders/uuid.js";
import decodeJOSELike from "./decoders/jose-like.js";
import decodeCBOR from "./decoders/cbor.js";
import { Decoder, DecodeNode } from "./types.js";
import { decodeASN1 } from "./decoders/asn1.js";

const decoders: Decoder[] = [
    decodeURLLike,
    decodeUUID,
    decodeStringToBytes,
    decodeJSON,
    decodeUTF8,
    decodeUnixTimestamp,
    decodeJOSELike,
    decodeCBOR,
    decodeASN1
];

export default function decode(input: DecodeNode): DecodeNode[] {
    return decoders.map(decoder => decoder(input)).filter(x => x != null) as DecodeNode[];
}
