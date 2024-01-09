import { DecodeNode, Representation } from "../types";

export interface Property {
    description: string;
    value: DecodeNode;
}

export class ObjectNode extends DecodeNode {
    readonly properties: Property[];

    constructor(type: string, properties: Property[]) {
        super();
        this.setType(type);
        this.properties = properties;
    }

    get defaultType() {
        return "Object";
    }

    get defaultRepresentations() {
        return [];
    }

}