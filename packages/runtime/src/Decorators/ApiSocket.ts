import 'reflect-metadata';
import { IPCSocket } from '../Interfaces';
import { getDefaultRuntime, Runtime } from '../Runtime';
import type { Constructor } from '../Types';

function makeSocket<T extends IPCSocket>(Socket: Constructor<T> | (() => T)) {
  try {
    return (Socket as Function)();
  } catch (e) {
    if (e instanceof TypeError) {
      return new (Socket as Constructor<T>)();
    }
    throw e;
  }
}

export const ApiSocket = <T extends IPCSocket>(
  Socket: Constructor<T> | (() => T),
  runtime: Runtime = getDefaultRuntime()
) => <U extends Constructor>(target: U): U => {
  const socket = makeSocket(Socket);
  runtime.connect(socket);
  return target;
};
