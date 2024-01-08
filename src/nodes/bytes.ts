import { DecodeNode, Representation } from "../types";

export class BytesNode implements DecodeNode {
    readonly value: Uint8Array;

    constructor(value: Uint8Array) {
        this.value = value;
    }

    get description(): string {
        return this.value.length + " bytes";
    }

    get representations(): Representation[] {
        if (this.value.length == 0) {
            return [];
        }

        let asString = String.fromCharCode(...this.value);
        let base64 = btoa(asString);
        
        return [
            {format: "Hex", value: BytesNode.toHex(this.value, " ")},
            {format: "Base 64", value: base64},
            {format: "Base 64 URL", value: base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")},
            {format: "Array", value: "[" + [...this.value].join(", ") + "]"}
        ]
    }

    static toHex(array: Uint8Array, separator: string): string {
        let hex = [];
        for (let n of array) {
            let entry = n.toString(16);
            if (entry.length != 2) entry = "0" + entry;
            hex.push(entry);
        }
        return hex.join(separator);
    }

}