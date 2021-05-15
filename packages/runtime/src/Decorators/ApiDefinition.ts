import 'reflect-metadata';
import { getDefaultRuntime, Runtime } from '../Runtime';
import type { Constructor } from '../Types';
import { MetadataKeys } from './State';

export const ApiDefinition = (name: string, runtime: Runtime = getDefaultRuntime()) => <T extends Constructor>(
  target: T
): T => {
  if (Reflect.hasMetadata(MetadataKeys.definition, target)) {
    throw new Error(`Target already decorated with an @ApiDefintion`);
  }
  runtime.registerDefinition(name, target);
  Reflect.metadata(MetadataKeys.definition, name)(target as Function);
  return target;
};
