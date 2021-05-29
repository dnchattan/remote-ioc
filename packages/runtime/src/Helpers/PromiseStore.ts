import type { Serializable } from 'child_process';
import { nanoid } from 'nanoid';

type PromiseCallbacks = { resolve: (value: Serializable) => void; reject: (error: Serializable) => void };

export class PromiseStore {
  private promiseIdx = 0;
  private salt = nanoid(10);
  private readonly promises = new Map<string, PromiseCallbacks>();
  private nextPromiseId(): string {
    return `${this.salt}${this.promiseIdx++}`;
  }

  // TODO Add a timeout value and automatically expire stale promises
  // must use setTimeout and let it go dormant when map is empty to avoid
  // long running interval keeping the process alive

  create(): [string, Promise<any>] {
    let callbacks!: PromiseCallbacks;
    const promise = new Promise<any>((resolve, reject) => {
      callbacks = { resolve, reject };
    });
    const promiseId = this.nextPromiseId();
    this.promises.set(promiseId, callbacks);
    return [promiseId, promise];
  }

  resolve(promiseId: string, value: Serializable): void {
    const p = this.promises.get(promiseId);
    if (!this.promises.delete(promiseId) || !p) {
      throw new Error(`Promise '${promiseId}' not found`);
    }
    p.resolve(value);
  }

  reject(promiseId: string, value: Serializable): void {
    const p = this.promises.get(promiseId);
    if (!this.promises.delete(promiseId) || !p) {
      throw new Error(`Promise '${promiseId}' not found`);
    }
    p.reject(value);
  }
}
