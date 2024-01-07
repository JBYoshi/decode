export type DecodeValue = string | Uint8Array | number | bigint | boolean | null | Date;
export interface DecodeNode {
    title?: string;
    value: DecodeValue;
    children?: DecodeNode[];
};
export type Decoder = (input: DecodeValue) => DecodeNode | null;