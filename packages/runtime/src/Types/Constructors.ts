export type AbstractConstructor<T = unknown> = { prototype: T; name: string };
export type ConcreteConstructor<T = unknown> = { new (): T; prototype: T; name: string };
export type Constructor<T = unknown> = ConcreteConstructor<T> | AbstractConstructor<T>;

export type InstanceOf<T extends Constructor> = T extends AbstractConstructor
  ? T['prototype']
  : T extends ConcreteConstructor
  ? InstanceType<T>
  : never;
