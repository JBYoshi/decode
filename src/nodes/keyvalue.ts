import { DecodeNode } from "../types";

export class KeyValueNode implements DecodeNode {
    readonly key: DecodeNode;
    readonly value: DecodeNode;

    constructor(key: DecodeNode, value: DecodeNode) {
        this.key = key;
        this.value = value;
    }

    get description() {
        return this.key.representations[0]?.value ?? this.key.description ?? "";
    }

    get representations() {
        return this.value.representations;
    }
}