import { DecodeNode, Representation } from "../types";

export class FormatNode implements DecodeNode {
    readonly format: string;
    readonly value: DecodeNode;

    constructor(format: string, value: DecodeNode) {
        this.format = format;
        this.value = value;
    }

    get description(): string {
        return this.format;
    }

    get representations(): Representation[] {
        return [];
    }
}
