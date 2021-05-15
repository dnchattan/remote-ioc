import { ConcreteConstructor, Constructor } from '../Types';

export const MetadataKeys = {
  provider: Symbol('api:provider'),
  definition: Symbol('api:definition'),
};

export const providers = new Map<Constructor, ConcreteConstructor>();
export const definitions = new Set<string>();

export function resetState() {
  providers.clear();
}
