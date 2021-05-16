import 'reflect-metadata';
import type { Constructor } from '../Types';
import { bindToRuntime } from './ApiRuntime';
import { MetadataKeys } from './State';

export const ApiProvider = <T extends Constructor>(definition: T) => <U extends Constructor>(target: U): U => {
  const runtime = bindToRuntime(target);
  runtime.registerProvider(definition, target);
  const definitions = Reflect.getMetadata(MetadataKeys.provider, target) || [];
  Reflect.metadata(MetadataKeys.provider, [...definitions, definition])(target as Function);
  return target;
};
