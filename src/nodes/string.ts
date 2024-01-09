import { DecodeNode, Representation } from "../types";

export class StringNode extends DecodeNode {
    readonly value: string;

    constructor(value: string, type: string = "String") {
        super();
        this.value = value;
        this.setType(type);
    }

    get defaultType(): string {
        return "String";
    }

    get defaultRepresentations(): Representation[] {
        return [
            {format: "String", value: this.value}
        ];
    }
}
