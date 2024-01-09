export type Decoder = (input: DecodeNode) => DecodeNode | null;

export interface Representation {
    format: string;
    value: string;
}

export abstract class DecodeNode {
    private customKey: string | null = null;
    private customType: string | null = null;
    private customRepresentations: Representation[] = [];


    get type(): string {
        return this.customType || this.defaultType;
    }

    get description(): string | null {
        return null;
    }

    abstract get defaultType(): string;
    abstract get defaultRepresentations(): Representation[];
    get defaultChildren(): DecodeNode[] {
        return [];
    }

    get key(): string | null {
        return this.customKey;
    }

    get representations(): Representation[] {
        return [...this.defaultRepresentations, ...this.customRepresentations];
    }

    setKey(key: string): this {
        this.customKey = key;
        return this;
    }

    setType(type: string): this {
        this.customType = type;
        return this;
    }

    setDecodeRoot(format: string): this {
        // TODO: Figure out how I want to handle this
        this.setKey(format);
        return this;
    }

    addRepresentation(format: string, value: string): this {
        this.customRepresentations.push({format, value});
        return this;
    }
}
