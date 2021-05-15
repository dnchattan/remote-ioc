import 'reflect-metadata';
export declare const ApiDefinition: (name: string) => <T extends Constructor<unknown>>(target: T) => T;
export declare function getApiDefinition<T extends Constructor>(target: T): string;
