/* eslint-disable max-classes-per-file */
import { ipcMain, webContents, IpcMain } from 'electron';
import { IElectronIpc } from './IElectronIpc';

export class IpcMainSocket implements IElectronIpc {
  constructor(
    private readonly ipc: IpcMain = ipcMain,
    private readonly contents: typeof Electron.WebContents = webContents
  ) {}
  send(scope: string, channel: string, ...args: any[]): this {
    console.log('ipcMain_tx', { scope, channel, args });
    this.contents.getAllWebContents().forEach((contents) => contents.send(scope, channel, ...args));
    return this;
  }
  on(scope: string, channel: string, handler: (...args: any[]) => void): this {
    const handlerWrapper = (_: any, messageChannel: string, ...args: string[]) => {
      if (channel !== messageChannel) {
        return;
      }
      console.log('ipcMain_rcv', { scope, channel, args });
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
