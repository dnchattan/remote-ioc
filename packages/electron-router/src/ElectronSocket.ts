import { ISocket } from '@remote-ioc/runtime';
import { IElectronIpc } from './IPC/IElectronIpc';

export class ElectronSocket implements ISocket {
  constructor(private readonly scope: string, private readonly ipc: IElectronIpc) {}
  // eslint-disable-next-line class-methods-use-this
  close(): void {}
  send(channel: string, ...args: any[]): this {
    this.ipc.send(this.scope, channel, ...args);
    return this;
  }
  on(channel: string, handler: (...args: any[]) => void): this {
    this.ipc.on(this.scope, channel, handler);
    return this;
  }
  off(channel: string, handler: (...args: any[]) => void): this {
    this.ipc.off(this.scope, channel, handler);
    return this;
  }
}
