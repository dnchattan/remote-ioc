import { Constructor } from '../Types';
import { MetadataKeys } from './State';

export function getApiDefinitionName<T extends Constructor>(target: T): string {
  return Reflect.getMetadata(MetadataKeys.definition, target);
}
