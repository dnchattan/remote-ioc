import { EventEmitter } from 'events';
import { ApiDefinition } from '../Decorators';
import { Constructor } from '../Types';
import { DefaultedMap } from './DefaultedMap';
import { PromiseSink } from './PromiseSink';

// TODO: Move this out of helpers, since it's not fully generic anymore
export class AvailabilityMap<K extends Constructor, V> extends EventEmitter {
  private requests: DefaultedMap<string, PromiseSink<V>> = new DefaultedMap(() => new PromiseSink());

  request(key: K): Promise<V> {
    const name = ApiDefinition.nameOf(key);
    if (!this.requests.has(name)) {
      this.emit('request', key);
    }
    return this.requests.get(name).getValue();
  }

  resolve(key: K, value: V): void {
    const name = ApiDefinition.nameOf(key);
    this.requests.get(name).setValue(value);
  }

  reject(key: K, error: Error): void {
    const name = ApiDefinition.nameOf(key);
    this.requests.get(name).setValue(error);
  }
}
