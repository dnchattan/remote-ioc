import { ApiProxy } from './ApiProxy';
import { IPCSocket, Metadata, PropertyType } from './Interfaces';
import type { Promisify } from './Types';

export function importApi<T extends {}>(uid: string, socket: IPCSocket, metadata: Metadata): Promisify<T> {
  const proxy = new ApiProxy(uid, socket);
  const api: Promisify<T> = {} as Promisify<T>;

  for (const [key, type] of Object.entries(metadata.props)) {
    switch (type) {
      case PropertyType.Accessor: {
        Object.defineProperty(api, key, {
          get: () => proxy.get(key),
        });
        break;
      }
      case PropertyType.Method: {
        Object.defineProperty(api, key, {
          value: (...args: any[]) => proxy.call(key, ...args),
        });
        break;
      }
      default:
        throw new Error(`Invalid property type ${type}`);
    }
  }

  if (metadata.hasEvents) {
    Object.defineProperties(api, {
      on: {
        value: (eventName: string, handler: (...args: any[]) => void) => {
          proxy.on(eventName, handler);
        },
      },
      off: {
        value: (eventName: string, handler: (...args: any[]) => void) => {
          proxy.off(eventName, handler);
        },
      },
    });
  }
  return api;
}
