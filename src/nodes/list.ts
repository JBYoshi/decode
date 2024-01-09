import { DecodeNode, Representation } from "../types";

export class ListNode extends DecodeNode {
    readonly elements: DecodeNode[];

    constructor(type: string, elements: DecodeNode[]) {
        super();
        this.setType(type);
        this.elements = elements;
    }

    get defaultType() {
        return "List";
    }

    get defaultRepresentations() {
        return [];
    }

    get description() {
        return this.elements.length + " elements";
    }

    get defaultChildren() {
        return this.elements;
    }
}
