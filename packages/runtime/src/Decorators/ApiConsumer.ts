import 'reflect-metadata';
import { getDefaultRuntime, Runtime } from '../Runtime';
import type { Promisify } from '../Types';

export const ApiConsumer = <T>(runtime: Runtime = getDefaultRuntime()) => <U>(
  target: U,
  propertyKey: string | symbol
): void => {
  const definition = Reflect.getMetadata('design:type', target, propertyKey);
  let instance: Promisify<T> | undefined;
  Object.defineProperty(target, propertyKey, {
    get() {
      if (!instance) {
        instance = runtime.getProvider<T>(definition);
      }
      return instance;
    },
  });
};
