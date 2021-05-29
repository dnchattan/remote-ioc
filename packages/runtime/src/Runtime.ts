/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { AvailabilityMap, DefaultedMap } from './Helpers';
import { IRouter, IRuntime } from './Interfaces';
import { buildProxyFor } from './ProxyBuilder';
import { Constructor } from './Types';

/**
 * Should this runtime concept really be "RouterManager" or something like that?
 * Then runtime is really just a context which wraps routers and APIs all together and nothing more?
 */

export class Runtime implements IRuntime {
  // TODO:
  // track what definitions have been requested, and which are available.
  // on request, a router could synchronously resolve (e.g. Named Pipes)
  // or it could queue a discovery flow, and listen to updates as new
  // definition providers are emitted from their sockets
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

  request<D extends Constructor>(Definition: D): Promise<IRouter> {
    return this.definitionAvailability.request(Definition);
  }

  useRouter(router: IRouter): this {
    this.routers.add(router);
    for (const provider of this.providers) {
      router.registerProvider(provider);
    }
    return this;
  }

  registerProvider<P extends Constructor<unknown>>(Provider: P): this {
    this.providers.add(Provider);
    for (const router of this.routers) {
      router.registerProvider(Provider);
    }
    return this;
  }

  getProvider<T extends Constructor<unknown>>(Definition: T): InstanceType<T> {
    const ProxyClass = this.definitionProxyMap.get(Definition);
    return new ProxyClass() as InstanceType<T>;
  }
}
