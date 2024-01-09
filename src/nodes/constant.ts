import { DecodeNode, Representation } from "../types";

/**
 * Represents a value that needs no further decoding, such as a boolean value,
 * enum value, or null value. Can optionally have a human-readable name.
 */
export class ConstantNode extends DecodeNode {
    defaultType: string;
    decodedValue?: string;
    rawValue?: string;

    /**
     * @param type A description of the type
     * @param rawValue The raw value contained; should be omitted if there is only one instance of the type (example: null)
     * @param decodedValue A human-readable representation of the value, if known
     */
    constructor(type: string, rawValue?: string | number | bigint | boolean, decodedValue?: string) {
        super();
        this.defaultType = type;
        this.rawValue = (rawValue === undefined) ? undefined : rawValue + "";
        this.decodedValue = decodedValue;
    }

    static readonly TRUE: ConstantNode = new ConstantNode("Boolean", true, "True");
    static readonly FALSE: ConstantNode = new ConstantNode("Boolean", false, "False");
    static readonly NULL: ConstantNode = new ConstantNode("Null");

    static fromBoolean(value: boolean) {
        if (value) return ConstantNode.TRUE;
        return ConstantNode.FALSE;
    }

    get defaultRepresentations(): Representation[] {
        if (!this.rawValue) return [];
        if (!this.decodedValue) return [{format: "Raw", value: "" + this.rawValue}];

        return [
            {format: "Decoded", value: this.decodedValue},
            {format: "Raw", value: "" + this.rawValue},
        ];
    }
}