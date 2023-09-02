export default function decodeArray(input) {
    if (Array.isArray(input)) {
        return {
            title: "Array",
            value: input,
            children: input.map(item => ({value: item}))
        };
    }
    return null;
}
