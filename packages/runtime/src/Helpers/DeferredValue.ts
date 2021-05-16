export class DeferredValue<T> {
  private promise: Promise<T>;
  private setError?: (value: Error) => void = () => {};
  private setResult?: (value: T) => void = () => {};
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.setResult = resolve;
      this.setError = reject;
    });
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
