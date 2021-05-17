import { IPCSocket } from '@remote-ioc/runtime';
import { ipcRenderer, IpcRenderer } from 'electron';

export class IpcRendererSocket implements IPCSocket {
  constructor(private readonly ipc: IpcRenderer = ipcRenderer) {}
  // eslint-disable-next-line class-methods-use-this
  close(_scope: string): void {
    // no-op
  }
  send(scope: string, channel: string, ...args: any[]): void {
    this.ipc.send(scope, channel, ...args);
  }
  on(scope: string, channel: string, handler: (...args: any[]) => void): void {
    this.ipc.on(scope, (_, messageChannel, ...args: string[]) => {
      if (channel !== messageChannel) {
        return;
      }
      handler(...args);
    });
  }
}
