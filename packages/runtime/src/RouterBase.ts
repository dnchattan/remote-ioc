import { EventEmitter } from 'events';
import { ApiDefinition, ApiProvider } from './Decorators';
import { IRouter, ISocket } from './Interfaces';
import { ProviderServer } from './ProviderServer';
import { getRuntime } from './RuntimeContext';
import { Constructor } from './Types';

export abstract class RouterBase extends EventEmitter implements IRouter {
  protected providers = new Set<Constructor>();
  protected serverMap = new Map<Constructor, ProviderServer>();

  public getSocket<I = Record<string, any>, O = Record<string, any>, C = unknown>(
    Definition: Constructor
  ): ISocket<I, O, C> {
    return this.getSocketCore(Definition) as ISocket<I, O, C>;
  }

  protected abstract getSocketCore(Definition: Constructor): ISocket;

  public async queryDefinition(Definition: Constructor): Promise<boolean> {
    const defName = ApiDefinition.nameOf(Definition);
    for (const provider of this.providers) {
      if (ApiProvider.implementationsOf(provider).some((definition) => ApiDefinition.nameOf(definition) === defName)) {
        return true;
      }
    }
    return false;
  }

  public registerProvider<P extends Constructor>(Provider: P): this {
    this.providers.add(Provider);
    for (const definition of ApiProvider.implementationsOf(Provider)) {
      this.createServer(definition, Provider);
    }
    return this;
  }

  protected createServer<D extends Constructor, P extends D>(Definition: D, Provider: P): this {
    if (this.serverMap.get(Definition)) {
      return this;
    }
    const provider = getRuntime().getProviderServer(Provider) as InstanceType<D>;
    const server = new ProviderServer(Definition, provider, this);
    this.serverMap.set(Definition, server);
    return this;
  }
}
