export default function toString(value) {
    if (value instanceof Uint8Array) {
        return value.length + " bytes";
    }
    return "" + value;
}