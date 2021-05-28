export type ConstructorWithArgs<T = unknown, U extends any[] = unknown[]> = {
  new (...args: U): T;
  prototype: T;
  name: string;
};
export type Constructor<T = unknown> = { new (): T; prototype: T; name: string };
