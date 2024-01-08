import { DecodeNode, Representation } from "../types";

export class StringNode implements DecodeNode {
    readonly type: string;
    readonly value: string;

    constructor(value: string, type: string = "String") {
        this.value = value;
        this.type = type;
    }

    get description(): string {
        return this.type;
    }

    get representations(): Representation[] {
        return [
            {format: "String", value: this.value}
        ];
    }
}
