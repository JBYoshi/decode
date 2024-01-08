import { DecodeNode } from "../types";

export class KeyNode {
    readonly key: string;
    readonly value: DecodeNode;

    constructor(key: string, value: DecodeNode) {
        this.key = key;
        this.value = value;
    }
}
