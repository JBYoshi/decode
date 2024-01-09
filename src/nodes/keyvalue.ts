import { DecodeNode } from "../types";

export class KeyValueNode extends DecodeNode {
    readonly keyNode: DecodeNode;
    readonly valueNode: DecodeNode;

    constructor(key: DecodeNode, value: DecodeNode) {
        super();
        this.keyNode = key;
        key.setKey("Key");
        this.valueNode = value;
        value.setKey("Value");
    }

    get key(): string | null {
        return super.key || this.keyNode.representations[0]?.value || this.keyNode.description;
    }

    get defaultType(): string {
        return this.valueNode.type;
    }

    get description() {
        return this.valueNode.description;
    }

    get defaultRepresentations() {
        return this.valueNode.representations;
    }

    get defaultChildren() {
        return [this.keyNode, this.valueNode];
    }
}
