export interface ConstructorWithArgs<T = unknown, U extends any[] = any[]> {
  new (...args: U): T;
}
export interface Constructor<T = unknown> {
  new (): T;
}
