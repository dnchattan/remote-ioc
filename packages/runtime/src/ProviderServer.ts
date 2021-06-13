import { hasEvents } from './HasEvents';
import { IRouter, ISocket } from './Interfaces';
import { CallMethod, GetPropertyValue, ClientMessages, ServerMessages, SubscriptionMessage } from './Messages';
import { Constructor } from './Types';

const contextMap = new Map<unknown, unknown>();

export function useCallingContext<T>(target: unknown): T | undefined {
  return contextMap.get(target) as T;
}

function getWithContext<T>(target: any, key: string, context?: any): T {
  contextMap.set(target, context);
  try {
    return target[key];
  } finally {
    contextMap.delete(target);
  }
}

function callWithContext<T>(target: unknown, fn: Function, args: unknown[], context?: any): T {
  contextMap.set(target, context);
  try {
    return fn.apply(target, args);
  } finally {
    contextMap.delete(target);
  }
}

export class ProviderServer<D extends Constructor = Constructor> {
  private enabledEvents = new Map<string, (payload: any, context?: unknown) => void>();
  private readonly socket: ISocket<ClientMessages, ServerMessages>;

  constructor(Definition: D, private readonly provider: InstanceType<D>, router: IRouter) {
    this.socket = router.getSocket(Definition);
    this.socket.on('get', this.get.bind(this));
    this.socket.on('call', this.call.bind(this));
    this.socket.on('sub', this.subscribe.bind(this));
    this.socket.on('unsub', this.unsubscribe.bind(this));
  }

  private forwardEvent(eventName: string, payload: any, context?: unknown) {
    this.socket.send('send-event', { eventName, payload }, context);
  }

  private async get({ promiseId, propertyName }: GetPropertyValue, context?: unknown): Promise<void> {
    try {
      const value = getWithContext(this.provider, propertyName, context);
      this.socket.send('set-promise', { promiseId, success: true, value });
    } catch (e) {
      this.socket.send(
        'set-promise',
        {
          promiseId,
          success: false,
          error: {
            message: e.message,
            errorTag: e.errorTag,
          },
        },
        context
      );
    }
  }

  private async call({ promiseId, methodName, args }: CallMethod, context?: unknown): Promise<void> {
    try {
      const fn = this.provider[methodName as keyof InstanceType<D>];
      if (fn === undefined || typeof fn !== 'function') {
        throw new Error(`'${methodName}' is not a function`);
      }
      const value: Promise<any> = await callWithContext(this.provider, fn, args, context);
      this.socket.send('set-promise', { promiseId, success: true, value }, context);
    } catch (e) {
      this.socket.send(
        'set-promise',
        {
          promiseId,
          success: false,
          error: {
            message: e.message,
            errorTag: e.errorTag,
          },
        },
        context
      );
    }
  }

  private subscribe({ eventName }: SubscriptionMessage): void {
    // TODO: accept context, and store it with the listener!
    if (!hasEvents(this.provider)) {
      throw new Error('API does not support events!');
    }
    if (this.enabledEvents.has(eventName)) {
      return;
    }
    const handler = this.forwardEvent.bind(this, eventName);
    this.provider.on(eventName, handler);
    this.enabledEvents.set(eventName, handler);
  }

  private unsubscribe({ eventName }: SubscriptionMessage): void {
    if (!hasEvents(this.provider)) {
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
