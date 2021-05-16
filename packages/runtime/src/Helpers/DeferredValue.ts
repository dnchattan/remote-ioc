export class DeferredValue<T> {
  private promise: Promise<T>;
  private setError?: (value: Error) => void;
  private setResult?: (value: T) => void;
  constructor(value?: T | Error) {
    if (value !== undefined) {
      if (value instanceof Error) {
        this.promise = Promise.reject(value);
      } else {
        this.promise = Promise.resolve(value);
      }
    } else {
      this.promise = new Promise<T>((resolve, reject) => {
        this.setResult = resolve;
        this.setError = reject;
      });
    }
  }
  wait(): Promise<T> {
    return this.promise;
  }
  reject(error: Error) {
    this.setError?.(error);
    delete this.setError;
  }
  resolve(value: T) {
    this.setResult?.(value);
    delete this.setResult;
  }
}
