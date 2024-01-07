import { decodeUnixTimestamp } from "./decoders/unix-timestamp.js";
import decodeJSON from "./decoders/json.js";
import decodeStringToBytes from "./decoders/str-to-bytes.js";
import decodeURLLike from "./decoders/url.js";
import decodeUTF8 from "./decoders/utf8.js";
import decodeUUID from "./decoders/uuid.js";
import decodeJOSELike from "./decoders/jose-like.js";
import decodeCBOR from "./decoders/cbor.js";
import { DecodeNode, DecodeValue, Decoder } from "./types";

const decoders: Decoder[] = [
    decodeURLLike,
    decodeUUID,
    decodeStringToBytes,
    decodeJSON,
    decodeUTF8,
    decodeUnixTimestamp,
    decodeJOSELike,
    decodeCBOR
];

export default function decode(input: DecodeValue): DecodeNode[] {
    if (typeof input == "string") input = input.trim();
    return decoders.map(decoder => decoder(input)).filter(x => x != null) as DecodeNode[];
}
