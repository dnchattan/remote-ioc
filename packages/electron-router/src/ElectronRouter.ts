import { Constructor, ISocket, RouterBase, ApiProvider, ApiDefinition } from '@remote-ioc/runtime';
import { renderer } from 'electron-is';
import { ElectronSocket } from './ElectronSocket';
import { IElectronIpc } from './IPC/IElectronIpc';
import { IpcMainSocket } from './IPC/IpcMainSocket';
import { IpcRendererSocket } from './IPC/IpcRendererSocket';

export class ElectronRouter extends RouterBase {
  private ipc: IElectronIpc;
  constructor() {
    super();
    this.ipc = renderer() ? new IpcRendererSocket() : new IpcMainSocket();
    this.ipc.on('$electron-router', 'discover/request', this.onDiscoverRequest);
    this.ipc.on('$electron-router', 'discover/response', this.onDiscoverResponse);
    this.ipc.send('$electron-router', 'discover/request');
    if (renderer()) {
      setTimeout(this.onDiscoverRequest, 1);
    }
  }

  private onDiscoverRequest = () => {
    const definitions: string[] = [];
    for (const provider of this.providers) {
      definitions.push(...ApiProvider.implementationsOf(provider).map((def) => ApiDefinition.nameOf(def)));
    }
    this.ipc.send('$electron-router', 'discover/response', definitions);
  };

  private onDiscoverResponse = (definitions: string[]) => {
    this.emit('discover', definitions);
  };

  getSocket(Definition: Constructor): ISocket {
    return new ElectronSocket(ApiDefinition.nameOf(Definition), this.ipc);
  }
}
