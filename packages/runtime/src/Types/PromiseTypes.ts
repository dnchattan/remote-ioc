export type EnsurePromise<T> = T extends Promise<any> ? T : Promise<T>;
export type Promisify<T> = {
  [key in keyof T]: key extends 'on' | 'off'
    ? T[key]
    : T[key] extends (...args: infer P) => infer R
    ? (...args: P) => EnsurePromise<R>
    : EnsurePromise<T[key]>;
};
