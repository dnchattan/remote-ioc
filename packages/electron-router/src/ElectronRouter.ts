import { Constructor, ISocket, RouterBase, methodStub, ApiProvider, ApiDefinition } from '@remote-ioc/runtime';
import { renderer } from 'electron-is';
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
  }

  private onDiscoverRequest = () => {
    const definitions: Constructor[] = [];
    for (const provider of this.providers) {
      definitions.push(...ApiProvider.implementationsOf(provider));
    }
    this.ipc.send('$electron-router', 'discover/response', definitions);
  };

  private onDiscoverResponse = (definitions: Constructor[]) => {
    this.emit(
      'discover',
      definitions.map((def) => ApiDefinition.nameOf(def))
    );
  };

  getSocket(Definition: Constructor): ISocket {
    methodStub(this, Definition);
  }
}
