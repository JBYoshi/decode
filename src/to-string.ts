import { DecodeValue } from "./types";

export default function toString(value: DecodeValue) {
    if (value instanceof Uint8Array) {
        return value.length + " bytes";
    }
    return "" + value;
}
