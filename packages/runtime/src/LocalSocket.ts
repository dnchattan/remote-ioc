import { DefaultedMap } from './Helpers';
import { ISocket } from './Interfaces';

export class LocalServerSocket implements ISocket {
  private handlers = new DefaultedMap<string, ((...args: any[]) => void)[]>(() => []);
  // eslint-disable-next-line class-methods-use-this
  close(): void {
    // no-op
  }

  send(channel: string, ...args: any[]): this {
    this.handlers.get(channel).forEach((fn) => fn(...args));
    return this;
  }

  on(channel: string, handler: (...args: any[]) => void): this {
    this.handlers.get(channel).push(handler);
    return this;
  }

  off(channel: string, handler: (...args: any[]) => void): this {
    const handlers = this.handlers.get(channel);
    this.handlers.set(
      channel,
      handlers.filter((entry) => entry !== handler)
    );
    return this;
  }
}
