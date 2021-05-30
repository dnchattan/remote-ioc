/* eslint-disable max-classes-per-file */
import { IPCSocket } from '@remote-ioc/runtime';
import { DefaultedMap } from '@remote-ioc/runtime/lib/Helpers';
import { Server, Socket } from 'socket.io';

export class ChildServerSocket implements IPCSocket {
  constructor(private socket: Socket) {}
  close() {
    this.socket.disconnect();
  }

  send(scope: string, channel: string, ...args: any[]) {
    this.socket.emit(scope, channel, ...args);
  }

  on(scope: string, channel: string, handler: (...args: any[]) => void) {
    this.socket.on(scope, (eventChannel, ...args) => {
      if (channel !== eventChannel) {
        return;
      }
      handler(...args);
    });
  }
}

export class ServerSocket implements IPCSocket {
  private handlers = new DefaultedMap<string, ((...args: any[]) => void)[]>(() => []);
  constructor(private readonly server: Server) {
    server.on('connection', (socket) => {
      const childSocket = new ChildServerSocket(socket);
      this.handlers.get(`$runtime\0connected`).forEach((handler) => handler(childSocket));

      socket.on('message', (scope: string, channel: string, ...args) => {
        this.handlers.get(`${scope}\0${channel}`).forEach((handler) => handler(...args));
      });
    });
  }

  close(): void {
    this.server.close();
  }
  send(scope: string, channel: string, ...args: any[]): void {
    this.server.emit(scope, channel, ...args);
  }
  on(scope: string, channel: string, handler: (...args: any[]) => void): void {
    this.handlers.get(`${scope}\0${channel}`).push(handler);
  }
}
