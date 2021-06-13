import { ipcRenderer, IpcRenderer, IpcRendererEvent } from 'electron';
import { IElectronIpc } from './IElectronIpc';

export class IpcRendererSocket implements IElectronIpc {
  constructor(private readonly ipc: IpcRenderer = ipcRenderer) {}

  send(scope: string, channel: string, message: any, event: IpcRendererEvent): this {
    this.ipc.send(scope, channel, message, event);
    return this;
  }
  on(scope: string, channel: string, handler: (message: any, event: IpcRendererEvent) => void): this {
    const handlerWrapper = (event: IpcRendererEvent, messageChannel: string, message: any) => {
      if (channel !== messageChannel) {
        return;
      }
      handler(message, event);
    };
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    handler.handlerWrapper = handlerWrapper;
    this.ipc.on(scope, handlerWrapper);
    return this;
  }
  off(scope: string, _channel: string, handler: (message: any, event: IpcRendererEvent) => void): this {
    this.ipc.off(scope, (handler as any).handlerWrapper);
    return this;
  }
}
