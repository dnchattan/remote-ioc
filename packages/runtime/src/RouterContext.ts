import { IRouter } from './Interfaces';
import { Constructor } from './Types';

/**
 * Manages multiple routers and provides find capabilities for APIs
 */
export class RouterContext {
  // TODO:
  // track what definitions have been requested, and which are available.
  // on request, a router could synchronously resolve (e.g. Named Pipes)
  // or it could queue a discovery flow, and listen to updates as new
  // definition providers are emitted from their sockets
  private routers = new Set<IRouter>();

  /**
   * Adds a router to the collection
   * @param router
   */
  addRouter(router: IRouter): this {
    this.routers.add(router);
    return this;
  }

  registerProvider<P extends Constructor<unknown>>(Provider: P): this {
    for (const router of this.routers) {
      router.registerProvider(Provider);
    }
    return this;
  }
}
