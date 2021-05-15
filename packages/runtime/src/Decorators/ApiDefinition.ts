import 'reflect-metadata';
import { Constructor } from '../Types';
import { definitions, MetadataKeys } from './State';

export const ApiDefinition = (name: string) => <T extends Constructor>(target: T): T => {
  if (definitions.has(name)) {
    throw new Error(`Api definition already exists for the name '${name}'.`);
  }
  if (Reflect.hasMetadata(MetadataKeys.definition, target)) {
    throw new Error(`Target already decorated with an @ApiDefintion`);
  }
  definitions.add(name);
  Reflect.metadata(MetadataKeys.definition, name)(target as Function);
  return target;
};

export function getApiDefinition<T extends Constructor>(target: T): string {
  return Reflect.getMetadata(MetadataKeys.definition, target);
}
