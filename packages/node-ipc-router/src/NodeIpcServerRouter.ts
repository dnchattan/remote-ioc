import { ApiDefinition, Constructor, ISocket, RouterBase } from '@remote-ioc/runtime';
import { IPC } from 'node-ipc';
import { IpcSocket } from './IpcSocket';
import { IPCInstance, IPCServer } from './Types';

async function getServer(ipc: IPCInstance): Promise<IPCServer> {
  return new Promise((resolve) => {
    ipc.serve(() => {
      resolve(ipc.server);
    });
    ipc.server.start();
  });
}

export class NodeIpcServerRouter extends RouterBase {
  constructor(private readonly id: string) {
    super();
  }

  // eslint-disable-next-line class-methods-use-this
  public async queryDefinition(): Promise<boolean> {
    return false;
  }

  public getSocketCore(Definition: Constructor): ISocket {
    const name = ApiDefinition.nameOf(Definition);
    const ipc = new IPC();
    ipc.config.id = `ipc-router/${this.id}/${name}`;
    ipc.config.retry = 500;
    const deferredServer = getServer(ipc);
    return new IpcSocket(deferredServer, () => ipc.server.stop());
  }
}
