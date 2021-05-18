export class Mutex {
  private promise: Promise<void>;
  private reject?: Function = () => {};
  private resolve?: Function = () => {};
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  wait() {
    return this.promise;
  }
  kill() {
    this.reject?.();
    delete this.reject;
  }
  signal() {
    this.resolve?.();
    delete this.resolve;
  }
}
