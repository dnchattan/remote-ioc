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
   * Gets a socket to serve a provider for the given definition
   * @param Definition
   */
  getServer(Definition: Constructor): ISocket;

  /**
   * Gets a socket for the provided Definition
   */
  // getSocket(Definition: Constructor): ISocket;
}

export interface IRouterConstructor {
  new (runtime: IRuntime, ...args: any[]): IRouter;
}
