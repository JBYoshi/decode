import { DecodeNode, Representation } from "../types";

export interface Property {
    description: string;
    value: DecodeNode;
}

export class ObjectNode implements DecodeNode {
    readonly type?: string;
    readonly properties: Property[];
    readonly representations: Representation[];

    constructor(type: string, representations: string | Representation[], properties: Property[]) {
        this.type = type;
        if (typeof representations == "string") {
            this.representations = [{
                format: type,
                value: representations
            }];
        } else {
            this.representations = representations;
        }
        this.properties = properties;
    }

    get description() {
        return this.type;
    }

}