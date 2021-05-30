import { ISocket } from '@remote-ioc/runtime';
import type { Namespace, Server } from 'socket.io';
import type { Socket } from 'socket.io-client';

export class ClientSocket implements ISocket {
  constructor(private readonly socket: Server | Socket | Namespace) {}

  close() {
    (this.socket as any).disconnect?.();
    (this.socket as any).close?.();
  }

  send(channel: string, ...args: any[]): this {
    this.socket.send(channel, ...args);
    return this;
  }

  on(channel: string, handler: (...args: any[]) => void): this {
    const handlerWrapper = (messageChannel: string, ...args: any[]) => {
      if (channel !== messageChannel) {
        return;
      }
      handler(...args);
    };
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    handler.handlerWrapper = handlerWrapper;
    this.socket.on('message', handlerWrapper);
    return this;
  }

  off(_channel: string, handler: (...args: any[]) => void): this {
    this.socket.off('message', (handler as any).handlerWrapper);
    return this;
  }
}
