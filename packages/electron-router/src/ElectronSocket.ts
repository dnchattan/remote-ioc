import { ISocket } from '@remote-ioc/runtime';
import { IElectronIpc } from './IPC/IElectronIpc';

export class ElectronSocket implements ISocket {
  constructor(private readonly scope: string, private readonly ipc: IElectronIpc) {}
  // eslint-disable-next-line class-methods-use-this
  close(): void {}
  send(channel: string, message: any, context: any): this {
    this.ipc.send(this.scope, channel, message, context);
    return this;
  }
  on(channel: string, handler: (message: any, context: any) => void): this {
    this.ipc.on(this.scope, channel, handler);
    return this;
  }
  off(channel: string, handler: (message: any, context: any) => void): this {
    this.ipc.off(this.scope, channel, handler);
    return this;
  }
}
