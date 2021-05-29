import { IRouter } from './Interfaces';

/**
 * Manages multiple routers and provides find capabilities for APIs
 */
export class RouterContext {
  private routers = new Set<IRouter>();

  /**
   * Adds a router to the collection
   * @param router
   */
  addRouter(router: IRouter): this {
    this.routers.add(router);
    return this;
  }
}
