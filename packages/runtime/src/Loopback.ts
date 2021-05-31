/* eslint-disable max-classes-per-file */
import { CollectionMap } from './Helpers';
import { ISocket } from './Interfaces';

// TODO: restrict which channels work for client vs. server?

class LoopbackSocket implements ISocket {
  private handlers = new CollectionMap<string, (message: any, context?: unknown) => void>();
  constructor(readonly scope: string, private readonly loopback: Loopback) {}
  dispose() {
    for (const [channel, handlers] of this.handlers) {
      for (const handler of handlers) {
        this.loopback.off(this.scope, channel, handler);
      }
    }
    this.handlers.clear();
  }

  close() {
    this.loopback.close(this);
  }

  send(channel: string, message: any): this {
    this.loopback.send(this.scope, channel, message);
    return this;
  }

  on(channel: string, handler: (message: any, context?: unknown) => void): this {
    this.handlers.push(channel, handler);
    this.loopback.on(this.scope, channel, handler);
    return this;
  }

  off(channel: string, handler: (message: any, context?: unknown) => void): this {
    this.handlers.remove(`${this.scope}\0${channel}`, handler);
    this.loopback.off(this.scope, channel, handler);
    return this;
  }
}

export class Loopback {
  private handlers = new CollectionMap<string, (message: any, context?: unknown) => void>();
  private sockets = new CollectionMap<string, LoopbackSocket>();

  // eslint-disable-next-line class-methods-use-this
  close(socket: LoopbackSocket): void {
    socket.dispose();
    this.sockets.remove(socket.scope, socket);
  }

  send(scope: string, channel: string, message: any, context?: unknown): this {
    this.handlers.forEachValue(`${scope}\0${channel}`, (fn) => fn(message, context));
    return this;
  }

  on(scope: string, channel: string, handler: (message: any, context?: unknown) => void): this {
    this.handlers.push(`${scope}\0${channel}`, handler);
    return this;
  }

  off(scope: string, channel: string, handler: (message: any, context?: unknown) => void): this {
    this.handlers.remove(`${scope}\0${channel}`, handler);
    return this;
  }

  createSocket(scope: string): ISocket {
    const server = new LoopbackSocket(scope, this);
    this.sockets.push(scope, server);
    return server;
  }
}
