import { EventEmitter } from 'events';
import { ApiDefinition } from './Decorators';
import { ApiProvider } from './Decorators/ApiProvider';
import { DefaultedMap } from './Helpers';
import { IRouter, ISocket } from './Interfaces';
import { Loopback } from './Loopback';
import { ProviderServer } from './ProviderServer';
import { getLoopback } from './RuntimeContext';
import { Constructor } from './Types';

export class LocalRouter extends EventEmitter implements IRouter {
  private loopback: Loopback = getLoopback() || new Loopback();
  private providers = new Set<Constructor>();

  private providerMap = new DefaultedMap<Constructor, unknown>((Provider) => new Provider());
  private serverMap = new Map<Constructor, ProviderServer>();

  constructor(readonly name: string) {
    super();
    this.loopback.on('$local-router', 'discover/request', this.onDiscoverRequest);
    this.loopback.on('$local-router', 'discover/response', this.onDiscoverResponse);
    setTimeout(() => {
      this.loopback.send('$local-router', 'discover/request');
    }, 5);
  }

  private onDiscoverRequest = () => {
    const definitions: Constructor[] = [];
    for (const provider of this.providers) {
      definitions.push(...ApiProvider.implementationsOf(provider));
    }
    this.loopback.send('$local-router', 'discover/response', definitions);
  };

  private onDiscoverResponse = (definitions: Constructor[]) => {
    this.emit('discover', definitions);
  };

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
    const scope = ApiDefinition.nameOf(Definition);
    const socket = this.loopback.createSocket(scope);
    return socket;
  }
}
