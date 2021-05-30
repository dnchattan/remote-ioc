import { ipcRenderer, IpcRenderer } from 'electron';
import { IElectronIpc } from './IElectronIpc';

export class IpcRendererSocket implements IElectronIpc {
  constructor(private readonly ipc: IpcRenderer = ipcRenderer) {}

  send(scope: string, channel: string, ...args: any[]): this {
    this.ipc.send(scope, channel, ...args);
    return this;
  }
  on(scope: string, channel: string, handler: (...args: any[]) => void): this {
    const handlerWrapper = (_: any, messageChannel: string, ...args: string[]) => {
      if (channel !== messageChannel) {
        return;
      }
      handler(...args);
    };
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    handler.handlerWrapper = handlerWrapper;
    this.ipc.on(scope, handlerWrapper);
    return this;
  }
  off(scope: string, _channel: string, handler: (...args: any[]) => void): this {
    this.ipc.off(scope, (handler as any).handlerWrapper);
    return this;
  }
}
