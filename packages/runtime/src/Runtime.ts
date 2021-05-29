/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { IRouter, IRuntime } from './Interfaces';
import { RouterContext } from './RouterContext';
import { Constructor } from './Types';

/**
 * Should this runtime concept really be "RouterManager" or something like that?
 * Then runtime is really just a context which wraps routers and APIs all together and nothing more?
 */

export class Runtime implements IRuntime {
  private routerContext: RouterContext = new RouterContext();

  useRouter(router: IRouter): this {
    this.routerContext.addRouter(router);
    return this;
  }

  registerProvider<D extends Constructor<unknown>, P extends D>(Provider: P): this {
    this.routerContext.registerProvider(Provider);
    return this;
  }

  getProvider<T extends Constructor<unknown>>(Definition: T): InstanceType<T> {
    throw new Error('Method not implemented.');
  }
}
