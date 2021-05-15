export type AbstractConstructor<T = unknown> = { prototype: T; name: string };
export type ConcreteConstructor<T = unknown> = { new (): T; name: string };
export type Constructor<T = unknown> = ConcreteConstructor<T> | AbstractConstructor<T>;
