import 'reflect-metadata';
import { IPCSocket } from '../Interfaces';
import type { Constructor } from '../Types';
import { bindToRuntime } from './ApiRuntime';

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

export const ApiSocket = <T extends IPCSocket>(Socket: Constructor<T> | (() => T)) => <U extends Constructor>(
  target: U
): U => {
  const socket = makeSocket(Socket);
  const runtime = bindToRuntime(target);
  runtime.connect(socket);
  return target;
};
