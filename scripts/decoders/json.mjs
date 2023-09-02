export default function decodeJSON(s) {
    if (typeof s != "string") return null;

    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
        try {
            return {title: "JSON", value: JSON.parse(s)};
        } catch (e) {
            return null;
        }
    }
    return null;
}
