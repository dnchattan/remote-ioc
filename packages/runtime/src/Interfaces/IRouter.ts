import { Constructor } from '../Types';
import { IRuntime } from './IRuntime';
import { ISocket } from './ISocket';

/**
 * Responsible for routing an API definition to the appropriate `ISocket`
 */
export interface IRouter {
  /**
   * Registers a local provider for this router
   * @param Provider
   */
  registerProvider<P extends Constructor<unknown>>(Provider: P): this;

  /**
   * Returns whether this router can route to the requested definition
   * @param Definition
   */
  queryDefinition(Definition: Constructor): Promise<boolean>;

  /**
   * Gets a socket for the provided Definition
   */
  getSocket(Definition: Constructor): ISocket;

  on(event: 'discover', handler: (Definitions: string[]) => void): this;
  off(event: 'discover', handler: (Definitions: string[]) => void): this;
}

export interface IRouterConstructor {
  new (runtime: IRuntime, ...args: any[]): IRouter;
}
