import { DecodeNode, Representation } from "../types";

export class StringNode implements DecodeNode {
    readonly value: string;

    constructor(value: string) {
        this.value = value;
    }

    get description(): string {
        return "String";
    }

    get representations(): Representation[] {
        return [
            {format: "String", value: this.value}
        ];
    }
}
