export interface IPCSocket {
  close(scope?: string): void;
  send(scope: string, channel: string, ...args: any[]): void;
  on(scope: string, channel: string, handler: (...args: any[]) => void): void;
}
