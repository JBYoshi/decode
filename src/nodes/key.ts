import { DecodeNode } from "../types";

export class KeyNode implements DecodeNode {
    readonly key: string;
    readonly value: DecodeNode;

    constructor(key: string, value: DecodeNode) {
        this.key = key;
        this.value = value;
    }

    get description() {
        return this.key;
    }

    get representations() {
        return [];
    }
}