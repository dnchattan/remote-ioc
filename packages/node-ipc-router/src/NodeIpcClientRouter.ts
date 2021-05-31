import { ApiDefinition, Constructor, ISocket, RouterBase } from '@remote-ioc/runtime';
import { IPC } from 'node-ipc';
import { IpcSocket } from './IpcSocket';
import { IPCInstance, IPCServer } from './Types';

async function getClient(ipc: IPCInstance, id: string): Promise<IPCServer> {
  return new Promise((resolve) => {
    ipc.connectTo(id, () => {
      const client: IPCServer = ipc.of[id];
      client.on('connect', () => resolve(client));
    });
  });
}

export class NodeIpcClientRouter extends RouterBase {
  constructor(private readonly id: string) {
    super();
  }

  // eslint-disable-next-line class-methods-use-this
  public async queryDefinition(): Promise<boolean> {
    return true;
  }
  public getSocketCore(Definition: Constructor): ISocket {
    const name = ApiDefinition.nameOf(Definition);
    const ipc = new IPC();
    const id = `ipc-router/${this.id}/${name}`;
    ipc.config.id = id;
    ipc.config.retry = 500;
    const deferredClient = getClient(ipc, id);
    return new IpcSocket(deferredClient, () => ipc.disconnect(id));
  }
}
