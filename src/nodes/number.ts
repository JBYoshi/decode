import { DecodeNode, Representation } from "../types";

export class NumberNode extends DecodeNode {
    readonly value: number | BigInt;

    constructor(value: number | BigInt) {
        super();
        this.value = value;
    }

    get defaultType(): string {
        return "Number";
    }

    get defaultRepresentations(): Representation[] {
        return [
            {format: "Number", value: "" + this.value}
        ];
    }
    
}