/* eslint-disable max-classes-per-file */
import type { IPCSocket } from '@remote-ioc/runtime';
import { ipcMain, webContents, IpcMain } from 'electron';

export class IpcMainSocket implements IPCSocket {
  constructor(
    private readonly ipc: IpcMain = ipcMain,
    private readonly contents: typeof Electron.WebContents = webContents
  ) {}
  // eslint-disable-next-line class-methods-use-this
  close(_scope: string): void {
    // no-op
  }
  send(scope: string, channel: string, ...args: any[]): void {
    this.contents.getAllWebContents().forEach((contents) => contents.send(scope, channel, ...args));
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
