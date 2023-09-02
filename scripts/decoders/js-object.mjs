export default function decodeJSObject(input) {
    if (Object.getPrototypeOf(input) != Object.prototype) return null;

    return {
        title: "Object",
        value: JSON.stringify(input),
        children: Object.keys(input).map(key => ({title: key, value: input[key]}))
    };
}
