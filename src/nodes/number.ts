import { DecodeNode, Representation } from "../types";

export class NumberNode implements DecodeNode {
    readonly type: string;
    readonly value: number | BigInt;

    constructor(value: number | BigInt, type: string = "Number") {
        this.type = type;
        this.value = value;
    }

    get description(): string {
        return this.type;
    }

    get representations(): Representation[] {
        return [
            {format: "Number", value: "" + this.value}
        ];
    }
    
}