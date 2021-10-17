import type { Constructor } from '../Types';
import type { IRouter } from './IRouter';

export interface IRuntime {
  /**
   * Adds a router to this runtime's context
   * @param router
   */
  useRouter(router: IRouter): this;

  /**
   * Registers a definition
   * @param Definition
   */
  registerDefinition<D extends Constructor>(Definition: D): this;

  /**
   * Registers a provider for a given definition
   */
  registerProvider<D extends Constructor, P extends D>(Provider: P): this;

  /**
   * Gets a provider singleton for a given definition
   */
  getProvider<T extends Constructor>(Definition: T): InstanceType<T>;

  /**
   * Gets or creates a provider server
   * @param Provider Provider to create a server for
   */
  getProviderServer<P extends Constructor>(Provider: P): unknown;
}
