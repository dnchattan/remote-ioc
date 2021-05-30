export interface IElectronIpc {
  send(scope: string, channel: string, ...args: any[]): this;
  on(scope: string, channel: string, handler: (...args: any[]) => void): this;
  off(scope: string, channel: string, handler: (...args: any[]) => void): this;
}
