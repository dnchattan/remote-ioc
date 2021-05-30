import { IPCSocket } from '@remote-ioc/runtime';
import { io, Socket } from 'socket.io-client';

export class ClientSocket implements IPCSocket {
  constructor(private socket: Socket = io()) {}
  close() {
    this.socket.close();
  }

  send(scope: string, channel: string, ...args: any[]) {
    this.socket.send(scope, channel, ...args);
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
