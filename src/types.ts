export type Decoder = (input: DecodeNode) => DecodeNode | null;

export interface DecodeNode {
    description: string;

    representations: Representation[];
}

export interface Representation {
    format: string;
    value: string;
}
