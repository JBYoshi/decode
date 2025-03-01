import { DecodeNode } from "../types";

export interface Property {
    description: string;
    value: DecodeNode;
}

export class ObjectNode extends DecodeNode {
    readonly properties: DecodeNode[];

    constructor(type: string, properties: Property[]) {
        super();
        this.setType(type);
        this.properties = properties.map(prop => {
            prop.value.setKey(prop.description);
            return prop.value;
        });
        this.setChildrenSignificant(false);
    }

    get defaultType() {
        return "Object";
    }

    get defaultRepresentations() {
        return [];
    }

    get defaultChildren() {
        return this.properties;
    }

}