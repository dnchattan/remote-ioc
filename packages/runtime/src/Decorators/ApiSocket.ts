import 'reflect-metadata';
import { IPCSocket } from '../Interfaces';
import { getDefaultRuntime, Runtime } from '../Runtime';
import type { Constructor } from '../Types';

export const ApiSocket = <T extends IPCSocket>(
  Socket: Constructor<T> | (() => T),
  runtime: Runtime = getDefaultRuntime()
) => <U extends Constructor>(target: U): U => {
  const socket = (Socket as Function)();
  runtime.connect(socket);
  return target;
};
