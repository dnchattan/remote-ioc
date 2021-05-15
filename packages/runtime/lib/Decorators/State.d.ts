export declare const MetadataKeys: {
    provider: symbol;
    definition: symbol;
};
export declare const providers: Map<Constructor<unknown>, ConcreteConstructor<unknown>>;
export declare const definitions: Set<string>;
export declare function resetState(): void;
