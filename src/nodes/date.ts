import { DecodeNode, Representation } from "../types";

export class DateNode implements DecodeNode {
    readonly value: Date;
    readonly customRepresentation?: Representation;

    constructor(value: Date, customRepresentation?: Representation) {
        this.value = value;
        this.customRepresentation = customRepresentation;
    }

    get description() {
        return "Date";
    }

    get representations(): Representation[] {
        let representations = [
            {format: "Local date", value: this.value.toLocaleString()},
            {format: "UTC string", value: this.value.toUTCString()},
            {format: "ISO string", value: this.value.toISOString()},
            {format: "UTC offset (milliseconds)", value: this.value.getTime() + ""},
            {format: "UTC offset (seconds)", value: this.value.getTime() / 1000 + ""}
        ];
        if (this.customRepresentation) {
            representations.push(this.customRepresentation);
        }
        return representations;
    }
}