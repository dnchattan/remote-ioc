import type { Serializable } from 'child_process';
import { IRouter, ISocket } from './Interfaces';
import { Constructor } from './Types';

function apiHasEvents(
  api: any
): api is {
  off(eventName: string, handler: (...args: any[]) => void): void;
  on(eventName: string, handler: (...args: any[]) => void): void;
} {
  return api.on && typeof api.on === 'function' && api.off && typeof api.off === 'function';
}

export class ProviderServer<D extends Constructor = Constructor> {
  private enabledEvents = new Map<string, (...args: any[]) => void>();
  private readonly socket: ISocket;

  constructor(Definition: D, private readonly provider: InstanceType<D>, router: IRouter) {
    this.socket = router.getSocket(Definition);
    this.socket.on('get', this.get.bind(this));
    this.socket.on('call', this.call.bind(this));
    this.socket.on('subscribe', this.subscribe.bind(this));
    this.socket.on('unsubscribe', this.unsubscribe.bind(this));
  }

  private forwardEvent(eventName: string, ...args: any[]) {
    this.socket.send('send-event', eventName, ...args);
  }

  private async get(promiseId: number, propertyName: string): Promise<void> {
    try {
      const value = this.provider[propertyName as keyof InstanceType<D>];
      this.socket.send('set-promise', promiseId, true /* success */, value);
    } catch (e) {
      this.socket.send('set-promise', promiseId, false, e);
    }
  }

  private async call(promiseId: number, methodName: string, ...args: Serializable[]): Promise<void> {
    try {
      const fn = this.provider[methodName as keyof InstanceType<D>];
      if (fn === undefined || typeof fn !== 'function') {
        throw new Error(`'${methodName}' is not a function`);
      }
      const value = await (fn.apply(this.provider, args) as Promise<any>);
      this.socket.send('set-promise', promiseId, true /* success */, value);
    } catch (e) {
      this.socket.send('set-promise', promiseId, false, {
        message: e.message,
        errorTag: e.errorTag,
      });
    }
  }

  private subscribe(eventName: string): void {
    if (!apiHasEvents(this.provider)) {
      throw new Error('API does not support events!');
    }
    if (this.enabledEvents.has(eventName)) {
      return;
    }
    const handler = this.forwardEvent.bind(this, eventName);
    this.provider.on(eventName, handler);
    this.enabledEvents.set(eventName, handler);
  }

  private unsubscribe(eventName: string): void {
    if (!apiHasEvents(this.provider)) {
      throw new Error('API does not support events!');
    }
    const handler = this.enabledEvents.get(eventName);
    if (!handler) {
      return;
    }
    this.enabledEvents.delete(eventName);
    this.provider.off(eventName, handler);
  }
}
