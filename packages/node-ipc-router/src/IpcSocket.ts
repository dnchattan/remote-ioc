import { ISocket } from '@remote-ioc/runtime';
import { IPCServer } from './Types';

export class IpcSocket implements ISocket {
  constructor(private readonly deferredServer: Promise<IPCServer>, readonly close: () => void) {}
  send(channel: string, message: any, context: any): this {
    this.deferredServer.then((server) =>
      context ? server.emit(context, channel, message) : server.emit(channel, message)
    );
    return this;
  }
  on(channel: string, handler: (message: any, context: any) => void): this {
    const handlerWrapper = (message: any, context: any) => {
      handler(message, context);
    };
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    handler.handlerWrapper = handlerWrapper;

    this.deferredServer.then((server) => {
      server.on(channel, handlerWrapper);
    });

    return this;
  }
  off(channel: string, handler: (message: any, context: any) => void): this {
    this.deferredServer.then((server) => server.off(channel, (handler as any).handlerWrapper));
    return this;
  }
}
