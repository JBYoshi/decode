export default function toString(value) {
    if (value instanceof Uint8Array) {
        return [...value].join(",");
    }
    if (Array.isArray(value)) {
        return "[" + value.map(toString).join(", ") + "]";
    }
    if (Object.getPrototypeOf(value) == Object.prototype) {
        return "{" + Object.keys(value).map(key => JSON.stringify(key) + ": " + toString(value[key])).join(", ") + "}";
    }
    return "" + value;
}