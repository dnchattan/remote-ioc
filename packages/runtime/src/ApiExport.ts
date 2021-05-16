import type { Serializable } from 'child_process';
import { apiHasEvents } from './GenerateMetadata';
import { assert } from './Helpers';
import { IPCSocket } from './Interfaces';

/**
 * Exposes an API to remote processes over the provided pipe
 */
export class ApiExport<T> {
  private enabledEvents = new Map<string, (...args: any[]) => void>();
  constructor(private readonly api: T, private readonly uid: string, private readonly socket: IPCSocket) {
    socket.on(uid, 'get', this.get.bind(this));
    socket.on(uid, 'call', this.call.bind(this));
    socket.on(uid, 'subscribe', this.subscribe.bind(this));
    socket.on(uid, 'unsubscribe', this.unsubscribe.bind(this));
  }

  private forwardEvent(eventName: string, ...args: any[]) {
    this.socket.send(this.uid, 'send-event', eventName, ...args);
  }

  private async get(promiseId: number, propertyName: string): Promise<void> {
    try {
      const value = this.api[propertyName as keyof T];
      this.socket.send(this.uid, 'set-promise', promiseId, true /* success */, value);
    } catch (e) {
      this.socket.send(this.uid, 'set-promise', promiseId, false, e);
    }
  }

  private async call(promiseId: number, methodName: string, ...args: Serializable[]): Promise<void> {
    try {
      const fn = this.api[methodName as keyof T];
      assert(fn !== undefined && typeof fn === 'function', `'${methodName}' is not a function`);
      const value = await (fn.apply(this.api, args) as Promise<any>);
      this.socket.send(this.uid, 'set-promise', promiseId, true /* success */, value);
    } catch (e) {
      this.socket.send(this.uid, 'set-promise', promiseId, false, {
        message: e.message,
        errorTag: e.errorTag,
      });
    }
  }

  private subscribe(eventName: string): void {
    if (!apiHasEvents(this.api)) {
      throw new Error('API does not support events!');
    }
    if (this.enabledEvents.has(eventName)) {
      return;
    }
    const handler = this.forwardEvent.bind(this, eventName);
    this.api.on(eventName, handler);
    this.enabledEvents.set(eventName, handler);
  }

  private unsubscribe(eventName: string): void {
    if (!apiHasEvents(this.api)) {
      throw new Error('API does not support events!');
    }
    const handler = this.enabledEvents.get(eventName);
    if (!handler) {
      return;
    }
    this.enabledEvents.delete(eventName);
    this.api.off(eventName, handler);
  }
}
