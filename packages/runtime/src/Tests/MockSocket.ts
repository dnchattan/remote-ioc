import { DefaultedMap } from '../Helpers';
import { Channel, IPCSocket } from '../Interfaces';

export function createSocketMock(): IPCSocket {
  return {
    close: jest.fn(),
    on: jest.fn(),
    send: jest.fn(),
  };
}

export class MockSocket implements IPCSocket {
  private eventHandlers = new DefaultedMap<string, ((...args: any[]) => void)[]>(() => []);
  private sendHandlers = new Map<[scope: string, Channel: string, ...args: any[]], (...args: any[]) => void>();

  // eslint-disable-next-line class-methods-use-this
  close = jest.fn();

  send(...args: [scope: string, channel: Channel, ...args: any[]]): void {
    for (const [matchArgs, callback] of this.sendHandlers) {
      if (matchArgs.every((arg, idx) => args[idx] === arg)) {
        callback(...args);
      }
    }
  }

  on(scope: string, channel: Channel, handler: (...args: any[]) => void): void {
    this.eventHandlers.get(`${scope}\0${channel}`).push(handler);
  }

  handleSend(
    args: [scope: string, channel: Channel, ...args: any[]],
    handler: (scope: string, channel: Channel, ...extraArgs: any[]) => void
  ): this {
    this.sendHandlers.set(args, handler);
    return this;
  }

  sendEvent(scope: string, channel: Channel, ...args: any[]): void {
    this.eventHandlers.get(`${scope}\0${channel}`).forEach((fn) => fn(...args));
  }
}
