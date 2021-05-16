import type { Serializable } from 'child_process';
import { PromiseStore, DefaultedMap, DeferredValue } from './Helpers';
import { IPCSocket } from './Interfaces';

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
  constructor(private readonly uid: string, private readonly deferredSocket: DeferredValue<IPCSocket>) {
    this.deferredSocket
      .wait()
      .then((socket) => {
        socket.on(uid, 'set-promise', setPromise);
        socket.on(uid, 'send-event', this.sendEvent.bind(this));
      })
      .catch(() => {});
  }

  public async get(propertyName: string) {
    try {
      const socket = await this.deferredSocket.wait();

      const [promiseId, result] = promises.create();
      socket.send(this.uid, 'get', promiseId, propertyName);
      return await result;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async call(methodName: string, ...args: Serializable[]) {
    try {
      const socket = await this.deferredSocket.wait();

      const [promiseId, result] = promises.create();
      socket.send(this.uid, 'call', promiseId, methodName, ...args);
      return await result;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public on(eventName: string, handler: MessageHandler): this {
    const listenerCount = this.eventListeners.get(eventName).push(handler);
    // first listener of this type?
    if (listenerCount === 1) {
      this.deferredSocket.wait().then((socket) => socket.send(this.uid, 'subscribe', eventName));
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
      this.deferredSocket.wait().then((socket) => socket.send(this.uid, 'unsubscribe', eventName));
    }
    return this;
  }

  private sendEvent(channel: string, ...args: Serializable[]) {
    this.eventListeners.get(channel).forEach((fn) => fn(...args));
  }
}
