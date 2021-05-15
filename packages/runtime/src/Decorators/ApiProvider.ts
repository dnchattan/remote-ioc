import 'reflect-metadata';
import { getDefaultRuntime, Runtime } from '../Runtime';
import type { ConcreteConstructor, Constructor } from '../Types';
import { MetadataKeys } from './State';

export const ApiProvider = <T extends Constructor>(definition: T, runtime: Runtime = getDefaultRuntime()) => <
  U extends ConcreteConstructor
>(
  target: U
): U => {
  runtime.registerProvider(definition, target);
  const definitions = Reflect.getMetadata(MetadataKeys.provider, target) || [];
  Reflect.metadata(MetadataKeys.provider, [...definitions, definition])(target as Function);
  return target;
};
