export type Constructor<T = unknown> = { new (): T; prototype: T; name: string };
export type InstanceOf<T extends Constructor> = InstanceType<T>;
