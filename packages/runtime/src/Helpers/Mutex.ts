export class Mutex {
  private promise: Promise<void> = Promise.resolve();
  private resolve?: Function = () => {};
  constructor() {
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
  wait() {
    return this.promise;
  }
  signal() {
    this.resolve?.();
    delete this.resolve;
  }
}
