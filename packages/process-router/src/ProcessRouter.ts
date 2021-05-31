/* eslint-disable max-classes-per-file */
import type { ChildProcess, Serializable } from 'child_process';
import { ApiDefinition, Constructor, ISocket, ApiProvider, RouterBase } from '@remote-ioc/runtime';

class ProcessSocket implements ISocket {
  constructor(private readonly scope: string, private readonly ipc: ChildProcess | NodeJS.Process) {
    if (!ipc.send) {
      throw new Error('Process is not enabled for IPC communication');
    }
  }
  close(): void {
    // @ts-ignore
    this.ipc.kill();
  }
  send(channel: string, message: any, context?: unknown): this {
    this.ipc.send!([this.scope, channel, message, context]);
    return this;
  }
  on(channel: string, handler: (message: any, context?: unknown) => void): this {
    const handlerWrapper = ([messageScope, messageChannel, message, context]: Serializable[]) => {
      if (channel !== messageChannel || this.scope !== messageScope) {
        return;
      }
      handler(message, context);
    };
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    handler.handlerWrapper = handlerWrapper;
    this.ipc.on('message', handlerWrapper);
    return this;
  }
  off(_channel: string, handler: (message: any, context?: unknown) => void): this {
    this.ipc.off('message', (handler as any).handlerWrapper);
    return this;
  }
}

export class ProcessRouter extends RouterBase {
  constructor(private readonly ipc: ChildProcess | NodeJS.Process) {
    super();
    if (!ipc.send) {
      throw new Error('Process is not enabled for IPC communication');
    }
    this.ipc.on('message', this.handleProcessMessage);
    setTimeout(() => {
      this.ipc.send!(['$process-router', 'discover/request']);
    }, 0);
  }

  protected getSocketCore(Definition: Constructor): ISocket {
    return new ProcessSocket(ApiDefinition.nameOf(Definition), this.ipc);
  }

  private handleProcessMessage = ([scope, channel, message]: [scope: string, channel: string, message: any]) => {
    if (scope !== '$process-router') {
      return;
    }
    switch (channel) {
      case 'discover/request': {
        this.handleDiscoverRequest();
        return;
      }
      case 'discover/response': {
        this.handleDiscoverResponse(message);
        break;
      }
      default:
    }
  };

  private handleDiscoverRequest() {
    const definitions: string[] = [];
    for (const provider of this.providers) {
      definitions.push(...ApiProvider.implementationsOf(provider).map((def) => ApiDefinition.nameOf(def)));
    }
    this.ipc.send!(['$process-router', 'discover/response', definitions]);
  }

  private handleDiscoverResponse(definitions: string[]) {
    this.emit('discover', definitions);
  }
}
