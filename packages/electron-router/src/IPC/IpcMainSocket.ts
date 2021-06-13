/* eslint-disable max-classes-per-file */
import { ipcMain, webContents, IpcMain } from 'electron';
import { IpcMainEvent } from 'electron/main';
import { IElectronIpc } from './IElectronIpc';

export class IpcMainSocket implements IElectronIpc {
  constructor(
    private readonly ipc: IpcMain = ipcMain,
    private readonly contents: typeof Electron.WebContents = webContents
  ) {}
  send(scope: string, channel: string, message: any, event: IpcMainEvent): this {
    // scoped event?
    if (event?.reply) {
      event.reply(scope, channel, message);
    } else {
      // global event
      this.contents.getAllWebContents().forEach((contents) => contents.send(scope, channel, message));
    }
    return this;
  }
  on(scope: string, channel: string, handler: (message: any, event: IpcMainEvent) => void): this {
    const handlerWrapper = (event: IpcMainEvent, messageChannel: string, message: any) => {
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
  off(scope: string, _channel: string, handler: (message: any, event: IpcMainEvent) => void): this {
    this.ipc.off(scope, (handler as any).handlerWrapper);
    return this;
  }
}
