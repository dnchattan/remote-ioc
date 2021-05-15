declare type AbstractConstructor<T = unknown> = { prototype: T; name: string };
declare type ConcreteConstructor<T = unknown> = { new (): T; name: string };
declare type Constructor<T = unknown> = ConcreteConstructor<T> | AbstractConstructor<T>;
