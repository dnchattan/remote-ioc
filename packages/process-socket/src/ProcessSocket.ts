import type { ChildProcess, Serializable } from 'child_process';
import type { IPCSocket } from '@remote-ioc/runtime';

export class ProcessSocket implements IPCSocket {
  constructor(private readonly ipc: ChildProcess | NodeJS.Process) {
    if (!ipc.send) {
      throw new Error('Process is not enabled for IPC communication');
    }
  }
  close(_scope: string): void {
    // @ts-ignore
    this.ipc.kill();
  }
  send(scope: string, channel: string, ...args: any[]): void {
    this.ipc.send!([scope, channel, ...args]);
  }
  on(scope: string, channel: string, handler: (...args: any[]) => void): void {
    this.ipc.on('message', ([messageScope, messageChannel, ...args]: Serializable[]) => {
      if (channel !== messageChannel || scope !== messageScope) {
        return;
      }
      handler(...args);
    });
  }
}
