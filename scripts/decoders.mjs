import { decodeUnixTimestamp } from "./decoders/unix-timestamp.mjs";
import decodeJSON from "./decoders/json.mjs";
import decodeStringToBytes from "./decoders/str-to-bytes.mjs";
import decodeURLLike from "./decoders/url.mjs";
import decodeUTF8 from "./decoders/utf8.mjs";
import decodeUUID from "./decoders/uuid.mjs";
import decodeJOSELike from "./decoders/jose-like.mjs";
import decodeArray from "./decoders/js-array.mjs";
import decodeJSObject from "./decoders/js-object.mjs";
import decodeNull from "./decoders/null.mjs";
import decodeCBOR from "./decoders/cbor.mjs";

const decoders = [
    decodeURLLike,
    decodeUUID,
    decodeStringToBytes,
    decodeJSON,
    decodeArray,
    decodeJSObject,
    decodeNull,
    decodeUTF8,
    decodeUnixTimestamp,
    decodeJOSELike,
    decodeCBOR
];

export default function decode(input) {
    return decoders.map(decoder => decoder(input)).filter(x => x != null);
}
