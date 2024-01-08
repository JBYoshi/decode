import { DecodeNode, Representation } from "../types";

export class ListNode implements DecodeNode {
    readonly type: string;
    readonly representations: Representation[];
    readonly elements: DecodeNode[];

    constructor(type: string, representations: Representation[], elements: DecodeNode[]) {
        this.type = type;
        this.representations = representations;
        this.elements = elements;
    }

    get description() {
        return this.type + " (" + this.elements.length + " elements)";
    }
}