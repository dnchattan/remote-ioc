import { EventEmitter } from 'events';
import { DefaultedMap } from './DefaultedMap';
import { PromiseSink } from './PromiseSink';

export class AvailabilityMap<K, V> extends EventEmitter {
  private requests: DefaultedMap<K, PromiseSink<V>> = new DefaultedMap((key) => {
    this.emit('request', key);
    return new PromiseSink();
  });

  request(key: K): Promise<V> {
    return this.requests.get(key).getValue();
  }

  resolve(key: K, value: V): void {
    this.requests.get(key).setValue(value);
  }

  reject(key: K, error: Error): void {
    this.requests.get(key).setValue(error);
  }
}
