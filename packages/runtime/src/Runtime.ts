/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { ApiDefinition } from './Decorators';
import { AvailabilityMap, DefaultedMap } from './Helpers';
import { IRouter, IRuntime } from './Interfaces';
import { buildProxyFor } from './ProxyBuilder';
import { Constructor } from './Types';

export interface ProviderOptions {
  plainObject?: boolean;
}

export class Runtime implements IRuntime {
  private definitions = new Map<string, Constructor>();
  private routers = new Set<IRouter>();
  private definitionProxyMap = new DefaultedMap<Constructor, Constructor>((Definition) =>
    buildProxyFor(Definition, this.request(Definition))
  );
  private definitionAvailability = new AvailabilityMap<Constructor, IRouter>();
  private providers = new Set<Constructor>();

  constructor() {
    this.definitionAvailability.on('request', this.onFirstRequest);
  }

  private onFirstRequest = async (Definition: Constructor) => {
    const fanout = Array.from(this.routers.values()).map(async (router) => {
      const hasProvider = await router.queryDefinition(Definition);
      if (hasProvider) {
        this.definitionAvailability.resolve(Definition, router);
      }
    });
    await Promise.all(fanout);
  };

  private onDiscover = (router: IRouter, definitions: string[]) => {
    for (const defName of definitions) {
      const Definition = this.definitions.get(defName);
      if (!Definition) {
        continue;
      }
      this.definitionAvailability.resolve(Definition, router);
    }
  };

  registerDefinition<D extends Constructor>(Definition: D): this {
    this.definitions.set(ApiDefinition.nameOf(Definition), Definition);
    return this;
  }

  request<D extends Constructor>(Definition: D): Promise<IRouter> {
    return this.definitionAvailability.request(Definition);
  }

  useRouter(router: IRouter): this {
    this.routers.add(router);
    router.on('discover', this.onDiscover.bind(this, router));
    for (const provider of this.providers) {
      router.registerProvider(provider);
    }
    return this;
  }

  registerProvider<P extends Constructor>(Provider: P): this {
    this.providers.add(Provider);
    for (const router of this.routers) {
      router.registerProvider(Provider);
    }
    return this;
  }

  getProvider<T extends Constructor>(Definition: T): InstanceType<T> {
    const ProxyClass = this.definitionProxyMap.get(Definition);
    return new ProxyClass() as InstanceType<T>;
  }
}
