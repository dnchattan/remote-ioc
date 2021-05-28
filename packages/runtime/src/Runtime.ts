/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { IRuntime } from './Interfaces';
import { Constructor } from './Types';

export class Runtime implements IRuntime {
  registerProvider<D extends Constructor<unknown>, P extends D>(Provider: P, Definition: D): this {
    throw new Error('Method not implemented.');
  }
  getProvider<T extends Constructor<unknown>>(Definition: T): InstanceType<T> {
    throw new Error('Method not implemented.');
  }
}
