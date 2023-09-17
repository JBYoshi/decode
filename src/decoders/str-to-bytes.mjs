export function decodeBase64(input) {
    let decoded = atob(input);
    let array = [];
    for (let i = 0; i < decoded.length; i++) {
        array.push(decoded.charCodeAt(i));
    }
    return new Uint8Array(array);
}

export function decodeBase64URL(input) {
    let inStandardBase64 = input.replace(/_/g, "/").replace(/-/g, "+");
    while (inStandardBase64.length % 4 != 0) {
        inStandardBase64 += "=";
    }
    return decodeBase64(inStandardBase64);
}

export default function decodeStringToBytes(input) {
    if (typeof input != "string") return null;

    input = input.replaceAll(/[\s\n]/g, "");
    if (input.match(/^[01]+$/) && input.length % 8 == 0) {
        let result = [];
        for (let i = 0; i < input.length; i += 8) {
            result.push(parseInt(input.slice(i, i + 8), 2));
        }
        return {
            title: "Binary",
            value: new Uint8Array(result)
        };
    }
    if (input.match(/^[0-9a-fA-F\s]+$/) && input.length % 2 == 0) {
        let result = [];
        for (let i = 0; i < input.length; i += 2) {
            result.push(parseInt(input.slice(i, i + 2), 16));
        }
        return {
            title: "Hex",
            value: new Uint8Array(result)
        };
    }
    if (input.match(/^[0-9a-zA-Z+/]+={0,2}$/) && input.length % 4 == 0) {
        try {
            return {
                title: "Base 64",
                value: decodeBase64(input)
            };
        } catch (e) {
            console.warn(e);
        }
    }
    if (input.match(/^[0-9a-zA-Z_-]+$/) && input.length % 4 != 1) {
        try {
            return {
                title: "URL-safe base 64",
                value: decodeBase64URL(input)
            };
        } catch (e) {
            console.warn(e);
        }
    }
    return null;
}