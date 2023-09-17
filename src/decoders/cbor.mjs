// cbor is set up as a global library.

function representTree(title, value) {
    if (Array.isArray(value)) {
        return {
            title,
            value: "Array (" + value.length + " elements)",
            children: value.map(element => representTree(undefined, element))
        };
    }
    if (value instanceof Map) {
        return {
            title,
            value: "Map (" + [...value.keys()].length + " entries)",
            children: [...value.keys()].map(key => representTree(key, value.get(key)))
        };
    }
    if (Object.getPrototypeOf(value) == Object.prototype) {
        return {
            title,
            value: "Map (" + Object.keys(value).length + " entries)",
            children: Object.keys(value).map(key => representTree(key, value[key]))
        };
    }
    return {
        title,
        value
    };
}

export default function decodeCBOR(input) {
    if (!(input instanceof Uint8Array)) {
        return null;
    }
    try {
        let entries = cbor.decodeAllSync(input);
        if (entries.length == 1) {
            return representTree("CBOR", entries[0]);
        } else {
            return representTree("CBOR", entries);
        }
    } catch (e) {
        return null;
    }
}
