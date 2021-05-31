import { ISocket } from '@remote-ioc/runtime';
import { IPCServer } from './Types';

export class IpcSocket implements ISocket {
  constructor(private readonly deferredServer: Promise<IPCServer>, readonly close: () => void) {}
  send(channel: string, ...args: any[]): this {
    this.deferredServer.then((server) => server.emit(channel, args));
    return this;
  }
  on(channel: string, handler: (...args: any[]) => void): this {
    const handlerWrapper = (args: any[]) => {
      handler(...args);
    };
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    handler.handlerWrapper = handlerWrapper;

    this.deferredServer.then((server) => {
      server.on(channel, handlerWrapper);
    });

    return this;
  }
  off(channel: string, handler: (...args: any[]) => void): this {
    this.deferredServer.then((server) => server.off(channel, (handler as any).handlerWrapper));
    return this;
  }
}
