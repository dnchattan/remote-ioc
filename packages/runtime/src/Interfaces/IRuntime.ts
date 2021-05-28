import { Constructor } from '../Types';

export interface IRuntime {
  /**
   * Registers a provider for a given definition
   */
  registerProvider<D extends Constructor, P extends D>(Provider: P, Definition: D): this;

  /**
   * Gets a provider singleton for a given definition
   */
  getProvider<T extends Constructor>(Definition: T): InstanceType<T>;
}
