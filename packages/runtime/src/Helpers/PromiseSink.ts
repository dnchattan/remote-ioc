export class PromiseSink<T> {
  private promise: Promise<T>;
  private resolve?: (value: T) => void;
  private reject?: (error: Error) => void;
  constructor();
  constructor(value: T);
  constructor(error: Error);
  constructor(value?: T | Error) {
    if (value) {
      if (value instanceof Error) {
        this.promise = Promise.reject(value);
      } else {
        this.promise = Promise.resolve(value);
      }
    } else {
      this.promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  }

  getValue(): Promise<T> {
    return this.promise;
  }

  setValue(value: T | Error): void {
    if (value instanceof Error) {
      this.reject?.(value);
    } else {
      this.resolve?.(value);
    }
    delete this.reject;
    delete this.resolve;
  }
}
