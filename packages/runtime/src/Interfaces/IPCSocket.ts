import { Channel } from './Channel';

export interface IPCSocket {
  close(scope?: string): void;
  send(scope: string, channel: Channel, ...args: any[]): void;
  on(scope: string, channel: Channel, handler: (...args: any[]) => void): void;
}
