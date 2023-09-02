// cbor is set up as a global library.

export default function decodeCBOR(input) {
    if (!(input instanceof Uint8Array)) {
        return null;
    }
    try {
        return {title: "CBOR", value: cbor.decodeAllSync(input)};
    } catch (e) {
        return null;
    }
}
