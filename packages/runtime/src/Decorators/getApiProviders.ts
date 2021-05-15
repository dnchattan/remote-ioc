import { Constructor } from '../Types';
import { getApiDefinitionName } from './getApiDefinitionName';
import { MetadataKeys } from './State';

export function getApiProviders<T extends Constructor>(target: T): Constructor[] {
  return Reflect.getMetadata(MetadataKeys.provider, target) ?? [];
}

export function getApiProviderNames<T extends Constructor>(target: T): string[] {
  const definitions = getApiProviders(target);
  return definitions.map((definition) => getApiDefinitionName(definition));
}
