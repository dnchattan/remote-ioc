import { ISocket } from '@remote-ioc/runtime';
import { WebSocket } from 'isomorphic-ws';

export class WebSocketWithScope implements ISocket {
  constructor(private readonly scope: string, private readonly socket: Promise<WebSocket>) {}
  close(): void {
    this.socket.then((socket) => socket.close());
  }
  send(channel: string, message: any, context?: unknown): this {
    this.socket.then((socket) => socket.send(JSON.stringify([this.scope, channel, message, context])));
    return this;
  }
  on(channel: string, handler: (message: any, context?: unknown) => void): this {
    const handlerWrapper = (payload: Buffer) => {
      const [messageScope, messageChannel, messageBody, context] = JSON.parse(payload.toString('utf8'));
      if (channel !== messageChannel || this.scope !== messageScope) {
        return;
      }
      handler(messageBody, context);
    };
    // eslint-disable-next-line no-param-reassign
    (handler as any).handlerWrapper = handlerWrapper;
    this.socket.then((socket) => socket.on('message', handlerWrapper));
    return this;
  }
  off(_channel: string, handler: (message: any, context?: unknown) => void): this {
    this.socket.then((socket) => socket.off('message', (handler as any).handlerWrapper));
    return this;
  }
}
