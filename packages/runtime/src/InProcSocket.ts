import { DefaultedMap } from './Helpers';
import { IPCSocket } from './Interfaces';

export class InProcSocket implements IPCSocket {
  private handlers = new DefaultedMap<string, ((...args: any[]) => void)[]>(() => []);
  // eslint-disable-next-line class-methods-use-this
  close(_scope: string): void {
    // no-op
  }
  send(scope: string, channel: string, ...args: any[]): void {
    this.handlers.get(`${scope}\0${channel}`).forEach((fn) => fn(...args));
  }
  on(scope: string, channel: string, handler: (...args: any[]) => void): void {
    this.handlers.get(`${scope}\0${channel}`).push(handler);
  }
}
