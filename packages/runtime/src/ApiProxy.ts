import type { Serializable } from 'child_process';
import { PromiseStore } from './PromiseStore';
import { DefaultedMap } from './Helpers';
import { IPCSocket, Metadata } from './Interfaces';

const promises = new PromiseStore();

export type MessageHandler = (...args: Serializable[]) => void;

function setPromise(promiseId: number, success: boolean, value: Serializable) {
  if (success) {
    promises.resolve(promiseId, value);
  } else {
    promises.reject(promiseId, value);
  }
}

/**
 * Provides access to a remote API over the provided IPCSocket
 */
export class ApiProxy {
  private eventListeners = new DefaultedMap<string, MessageHandler[]>(() => []);
  constructor(private readonly uid: string, private readonly socket: IPCSocket) {
    socket.on(uid, 'set-promise', setPromise);
    socket.on(uid, 'send-event', this.sendEvent.bind(this));
  }

  public getMetadata(): Promise<Metadata> {
    const [promiseId, result] = promises.create();
    this.socket.send(this.uid, 'get-metadata', promiseId);
    return result;
  }

  public get(propertyName: string) {
    const [promiseId, result] = promises.create();
    this.socket.send(this.uid, 'get', promiseId, propertyName);
    return result;
  }

  public call(methodName: string, ...args: Serializable[]) {
    const [promiseId, result] = promises.create();
    this.socket.send(this.uid, 'call', promiseId, methodName, ...args);
    return result;
  }

  public on(eventName: string, handler: MessageHandler): this {
    const listenerCount = this.eventListeners.get(eventName).push(handler);
    // first listener of this type?
    if (listenerCount === 1) {
      this.socket.send(this.uid, 'subscribe', eventName);
    }
    return this;
  }

  public off(eventName: string, handler: MessageHandler): this {
    const listeners = this.eventListeners.get(eventName);
    const newListerers = listeners.filter((listener) => listener !== handler);
    this.eventListeners.set(
      eventName,
      listeners.filter((listener) => listener !== handler)
    );
    // last listener of this type?
    if (listeners.length > 0 && newListerers.length === 0) {
      this.socket.send(this.uid, 'unsubscribe', eventName);
    }
    return this;
  }

  private sendEvent(channel: string, ...args: Serializable[]) {
    this.eventListeners.get(channel).forEach((fn) => fn(...args));
  }
}
