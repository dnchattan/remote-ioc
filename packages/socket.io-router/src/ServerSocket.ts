import { Namespace } from 'socket.io';
import { CollectionMap, ISocket } from '@remote-ioc/runtime';

export class ServerSocket implements ISocket {
  private handlers = new CollectionMap<string, (...args: any[]) => void>();
  constructor(private readonly socket: Namespace) {
    socket.on('connection', (client) => {
      client.on('message', (channel: string, ...args) => {
        this.handlers.forEachValue(channel, (handler) => handler(...args));
      });
    });
  }

  close(): void {
    this.socket.disconnectSockets();
  }
  send(channel: string, ...args: any[]): this {
    this.socket.send(channel, ...args);
    return this;
  }
  on(channel: string, handler: (...args: any[]) => void): this {
    this.handlers.push(channel, handler);
    return this;
  }
  off(channel: string, handler: (...args: any[]) => void): this {
    this.handlers.remove(channel, handler);
    return this;
  }
}
