import { Metadata, PropertyType } from './Interfaces';
import { Constructor } from './Types';

function apiHasEvents(
  api: any
): api is {
  off(eventName: string, handler: (...args: any[]) => void): void;
  on(eventName: string, handler: (...args: any[]) => void): void;
} {
  return api.on && typeof api.on === 'function';
}

const internalKeys = ['constructor', 'on', 'off', 'emit'];

export function generateMetadata({ prototype }: Constructor) {
  const apiMetadata: Metadata = { props: {} };
  const descriptors: [string, PropertyDescriptor][] = [];
  let proto: any = prototype;
  do {
    descriptors.push(...Object.entries(Object.getOwnPropertyDescriptors(proto)));
    proto = Object.getPrototypeOf(proto);
  } while (proto.constructor !== Object);

  for (const [key, descriptor] of descriptors) {
    if (internalKeys.includes(key)) {
      continue;
    }
    if (descriptor.get) {
      apiMetadata.props[key] = PropertyType.Accessor;
      continue;
    }
    if (descriptor.value) {
      if (typeof descriptor.value === 'function') {
        apiMetadata.props[key] = PropertyType.Method;
      } else {
        apiMetadata.props[key] = PropertyType.Accessor;
      }
    }
  }
  apiMetadata.hasEvents = apiHasEvents(prototype);
  return apiMetadata;
}
