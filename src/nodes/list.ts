import { DecodeNode } from "../types";

export class ListNode extends DecodeNode {
    readonly elements: DecodeNode[];

    constructor(type: string, elements: DecodeNode[]) {
        super();
        this.setType(type);
        this.elements = elements;
        this.setChildrenSignificant(true);
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
