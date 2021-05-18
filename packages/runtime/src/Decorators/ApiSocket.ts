/* eslint-disable no-console */
import 'reflect-metadata';
import { IPCSocket } from '../Interfaces';
import type { Constructor, ConstructorWithArgs } from '../Types';
import { bindToRuntime } from './ApiRuntime';

function makeSocket<T extends IPCSocket>(Socket: ConstructorWithArgs<T> | ((...params: any[]) => T), ...args: any[]) {
  try {
    return (Socket as Function)(...args);
  } catch (e) {
    if (e instanceof TypeError) {
      return new (Socket as ConstructorWithArgs<T>)(...args);
    }
    throw e;
  }
}

export const ApiSocket = <T extends ConstructorWithArgs<IPCSocket> | ((...params: any[]) => IPCSocket)>(
  Socket: T,
  ...args: T extends ConstructorWithArgs<IPCSocket>
    ? ConstructorParameters<T>
    : T extends (...params: any[]) => IPCSocket
    ? Parameters<T>
    : never
) => <U extends Constructor>(target: U): U => {
  const socket = makeSocket(Socket, ...args);
  const runtime = bindToRuntime(target);
  runtime.connect(socket);
  /*
  {
    close(...params) {
      console.log(`${socket.constructor.name}: close(${params.join(',')})`);
      socket.close(params);
    },
    on(...params) {
      console.log(`${socket.constructor.name}: on(${params.join(',')})`);
      socket.on(...params);
    },
    send(...params) {
      console.log(`${socket.constructor.name}: send(${params.join(',')})`);
      socket.send(...params);
    },
  }
  */
  return target;
};
