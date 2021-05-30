/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
import type { ChildProcess, Serializable } from 'child_process';
import {
  ApiDefinition,
  Constructor,
  DefaultedMap,
  IRouter,
  ISocket,
  ProviderServer,
  ApiProvider,
} from '@remote-ioc/runtime';

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
  send(channel: string, ...args: any[]): this {
    this.ipc.send!([this.scope, channel, ...args]);
    return this;
  }
  on(channel: string, handler: (...args: any[]) => void): this {
    const handlerWrapper = ([messageScope, messageChannel, ...args]: Serializable[]) => {
      if (channel !== messageChannel || this.scope !== messageScope) {
        return;
      }
      handler(...args);
    };
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    handler.handlerWrapper = handlerWrapper;
    this.ipc.on('message', handlerWrapper);
    return this;
  }
  off(_channel: string, handler: (...args: any[]) => void): this {
    this.ipc.off('message', (handler as any).handlerWrapper);
    return this;
  }
}

export class ProcessRouter extends EventEmitter implements IRouter {
  private providers = new Set<Constructor>();
  private providerMap = new DefaultedMap<Constructor, unknown>((Provider) => new Provider());
  private serverMap = new Map<Constructor, ProviderServer>();

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

  private createServer<D extends Constructor, P extends D>(Definition: D, Provider: P): this {
    if (this.serverMap.get(Definition)) {
      return this;
    }
    const provider = this.providerMap.get(Provider) as InstanceType<D>;
    const server = new ProviderServer(Definition, provider, this);
    this.serverMap.set(Definition, server);
    return this;
  }

  async queryDefinition(Definition: Constructor): Promise<boolean> {
    const defName = ApiDefinition.nameOf(Definition);
    for (const provider of this.providers) {
      if (ApiProvider.implementationsOf(provider).some((definition) => ApiDefinition.nameOf(definition) === defName)) {
        return true;
      }
    }
    return false;
  }

  registerProvider<P extends Constructor>(Provider: P): this {
    this.providers.add(Provider);
    for (const definition of ApiProvider.implementationsOf(Provider)) {
      this.createServer(definition, Provider);
    }
    return this;
  }

  getSocket(Definition: Constructor): ISocket {
    return new ProcessSocket(ApiDefinition.nameOf(Definition), this.ipc);
  }

  private handleProcessMessage = ([scope, channel, ...args]: [
    scope: string,
    channel: string,
    ...args: Serializable[]
  ]) => {
    if (scope !== '$process-router') {
      return;
    }
    switch (channel) {
      case 'discover/request': {
        this.handleDiscoverRequest();
        return;
      }
      case 'discover/response': {
        this.handleDiscoverResponse(args[0] as string[]);
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
