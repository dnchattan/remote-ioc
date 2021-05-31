/* eslint-disable max-classes-per-file */
import { ApiDefinition } from './Decorators';
import { PromiseStore } from './Helpers';
import { IRouter } from './Interfaces';
import { ClientMessages, ServerMessages } from './Messages';
import { Constructor } from './Types';

const internalKeys = ['constructor', 'on', 'off', 'emit'];

export function buildProxyFor<D extends Constructor>(Definition: D, deferredRouter: Promise<IRouter>): D {
  const definitionName = ApiDefinition.nameOf(Definition);
  const className = `Proxy<${definitionName}>`;
  const classHolder: Record<string, Constructor> = {
    [className]: class {},
  };
  const ApiProxyClass: Constructor = classHolder[className];

  const promises = new PromiseStore();
  const deferredSocket = deferredRouter.then((router) => router.getSocket<ServerMessages, ClientMessages>(Definition));

  const descriptors: [string, PropertyDescriptor][] = [];
  let proto: any = Definition.prototype;
  do {
    descriptors.push(...Object.entries(Object.getOwnPropertyDescriptors(proto)));
    proto = Object.getPrototypeOf(proto);
  } while (proto.constructor !== Object);

  function makeAccessorDescriptor(propertyName: string) {
    return {
      async get() {
        try {
          const socket = await deferredSocket;
          const [promiseId, result] = promises.create();
          socket.send('get', { promiseId, propertyName });
          return await result;
        } catch (e) {
          return Promise.reject(e);
        }
      },
    };
  }

  function makeMethodDescriptor(methodName: string) {
    return {
      value: async (...args: any[]) => {
        try {
          const socket = await deferredSocket;
          const [promiseId, result] = promises.create();
          socket.send('call', { promiseId, methodName, args });
          return await result;
        } catch (e) {
          return Promise.reject(e);
        }
      },
    };
  }

  // wire up event listeners
  deferredSocket.then((socket) => {
    socket.on('set-promise', (message) => {
      if (message.success) {
        promises.resolve(message.promiseId, message.value);
      } else {
        promises.reject(message.promiseId, message.error);
      }
    });
  });

  for (const [key, descriptor] of descriptors) {
    if (internalKeys.includes(key)) {
      continue;
    }
    if (descriptor.get) {
      Object.defineProperty(ApiProxyClass.prototype, key, makeAccessorDescriptor(key));
      continue;
    }
    if (typeof descriptor.value !== 'function' || !descriptor.value) {
      throw new Error(`Invalid property type '${typeof descriptor.value}' for property '${key}'`);
    }
    Object.defineProperty(ApiProxyClass.prototype, key, makeMethodDescriptor(key));
  }
  return ApiProxyClass as D;
}
