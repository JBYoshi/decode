import { DecodeNode, Representation } from "../types";

/**
 * Represents a value from a list of known constant values that needs no further
 * decoding, such as a boolean value, enum value, or null value.
 */
export class ConstantNode implements DecodeNode {
    description_?: string;
    rawValue: string;

    constructor(rawValue: string | number | bigint, description?: string) {
        this.description_ = description;
        this.rawValue = rawValue + "";
    }

    get description() {
        // TODO
        return "";
    }

    get representations(): Representation[] {
        // TODO
        if (this.description_ == null) {
            return [{format: "Raw", value: this.rawValue}];
        };
        return [
            {format: "Decoded", value: this.description_},
            {format: "Raw", value: "" + this.rawValue}
        ];
    }
}