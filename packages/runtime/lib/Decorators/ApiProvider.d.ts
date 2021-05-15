import 'reflect-metadata';
export declare const ApiProvider: <T extends Constructor<unknown>>(definition: T) => <U extends ConcreteConstructor<unknown>>(target: U) => U;
export declare function getApiProviders<T extends Constructor>(target: T): Constructor[];
export declare function getApiProviderNames<T extends Constructor>(target: T): string[];
