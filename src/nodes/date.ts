import { DecodeNode, Representation } from "../types";

export class DateNode extends DecodeNode {
    readonly value: Date;

    constructor(value: Date) {
        super();
        this.value = value;
    }

    get defaultType() {
        return "Date";
    }

    get defaultRepresentations(): Representation[] {
        return [
            {format: "Local", value: this.value.toLocaleString(undefined, {dateStyle: "full", timeStyle: "full"})},
            {format: "UTC", value: this.value.toLocaleString(undefined, {timeZone: "UTC", dateStyle: "full", timeStyle: "full"})},
            {format: "ISO string", value: this.value.toISOString()},
            {format: "UTC offset (milliseconds)", value: this.value.getTime() + ""},
            {format: "UTC offset (seconds)", value: this.value.getTime() / 1000 + ""}
        ];
    }
}