import { DefaultedMap } from './DefaultedMap';

export class CollectionMap<K, V> extends DefaultedMap<K, V[]> {
  constructor() {
    super(() => []);
  }

  forEachValue(key: K, callback: (value: V, index: number, collection: V[]) => void) {
    this.get(key).forEach(callback);
  }

  push(key: K, ...values: V[]): number {
    return this.get(key).push(...values);
  }

  remove(key: K, ...values: V[]): void {
    this.set(
      key,
      this.get(key).filter((value) => !values.includes(value))
    );
  }
}
