export type DecodeValue = string | Uint8Array | number | bigint | boolean | null | Date;
export interface DecodeNode {
    /**
     * When this node is contained inside a larger data structure (ex: array/list), this should be the key identifying it.
     */
    key?: DecodeValue;
    /**
     * A human-readable description of the type of value this represents (ex: "string", "array").
     */
    description?: string;
    /**
     * The value that this type represents. This will be displayed to the user.
     */
    value: DecodeValue;
    /**
     * If supplied, this will override decoding the value.
     */
    children?: DecodeNode[];
};
export type Decoder = (input: DecodeValue) => DecodeNode | null;