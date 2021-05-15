import 'reflect-metadata';
import { ConcreteConstructor, Constructor } from '../Types';
import { getApiDefinition } from './ApiDefinition';
import { providers, MetadataKeys } from './State';

export const ApiProvider = <T extends Constructor>(definition: T) => <U extends ConcreteConstructor>(target: U): U => {
  const name = getApiDefinition(definition);
  if (!name) {
    throw new Error(`Type '${definition.name}' does not have an @ApiDefinition decorator`);
  }
  if (providers.has(definition)) {
    throw new Error(`Api provider already exists for the defintion '${name}'.`);
  }
  providers.set(definition, target);
  const definitions = Reflect.getMetadata(MetadataKeys.provider, target) || [];
  Reflect.metadata(MetadataKeys.provider, [...definitions, definition])(target as Function);
  return target;
};

export function getApiProviders<T extends Constructor>(target: T): Constructor[] {
  return Reflect.getMetadata(MetadataKeys.provider, target) ?? [];
}

export function getApiProviderNames<T extends Constructor>(target: T): string[] {
  const definitions = getApiProviders(target);
  return definitions.map((definition) => getApiDefinition(definition));
}
