import { Serializable } from 'child_process';
import { assert } from './Assert';

type PromiseCallbacks = { resolve: (value: Serializable) => void; reject: (error: Serializable) => void };

export class PromiseStore {
  private promiseIdx = 0;
  private readonly promises = new Map<number, PromiseCallbacks>();

  create(): [number, Promise<any>] {
    let callbacks!: PromiseCallbacks;
    const promise = new Promise<any>((resolve, reject) => {
      callbacks = { resolve, reject };
    });
    this.promises.set(this.promiseIdx, callbacks);
    return [this.promiseIdx++, promise];
  }

  resolve(promiseId: number, value: Serializable): void {
    const p = this.promises.get(promiseId);
    assert(this.promises.delete(promiseId) && p, `Promise '${promiseId}' not found`);
    p.resolve(value);
  }

  reject(promiseId: number, value: Serializable): void {
    const p = this.promises.get(promiseId);
    assert(this.promises.delete(promiseId) && p, `Promise '${promiseId}' not found`);
    p.reject(value);
  }
}
