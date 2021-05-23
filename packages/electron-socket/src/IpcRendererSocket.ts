import { Channel, IPCSocket } from '@remote-ioc/runtime';
import { ipcRenderer, IpcRenderer } from 'electron';

export class IpcRendererSocket implements IPCSocket {
  private discoverPayload?: any[];

  constructor(private readonly ipc: IpcRenderer = ipcRenderer) {
    this.on('$runtime', 'discover', this.cacheDiscovery);
    ipc.send('$runtime', 'connected');
  }

  private cacheDiscovery = (...args: any[]) => {
    this.discoverPayload = args;
  };

  // eslint-disable-next-line class-methods-use-this
  close(_scope: string): void {
    // no-op
  }
  send(scope: string, channel: Channel, ...args: any[]): void {
    this.ipc.send(scope, channel, ...args);
  }
  on(scope: string, channel: Channel, handler: (...args: any[]) => void): void {
    if (scope === '$runtime' && channel === 'discover' && this.discoverPayload) {
      handler(...this.discoverPayload);
    }
    this.ipc.on(scope, (_, messageChannel, ...args: string[]) => {
      if (channel !== messageChannel) {
        return;
      }
      handler(...args);
    });
  }
}
