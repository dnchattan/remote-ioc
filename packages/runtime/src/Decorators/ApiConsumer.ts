import 'reflect-metadata';
import type { Constructor, InstanceOf, Promisify } from '../Types';
import { bindToRuntime } from './ApiRuntime';

export const ApiConsumer = <U extends Constructor, T>(target: InstanceOf<U>, propertyKey: string | symbol): void => {
  const definition = Reflect.getMetadata('design:type', target as U, propertyKey);
  let instance: Promisify<T> | undefined;
  Object.defineProperty(target, propertyKey, {
    get() {
      const runtime = bindToRuntime(target as U);
      if (!instance) {
        instance = runtime.getProvider<T>(definition);
      }
      return instance;
    },
  });
};
