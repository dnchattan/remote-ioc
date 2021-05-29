/* eslint-disable class-methods-use-this */
import { ApiDefinition } from '@remote-ioc/runtime';

@ApiDefinition('fork-worker')
export class IForkWorker {
  async method(): Promise<string> {
    throw new Error('not implemented');
  }
  async methodWithParams(..._value: number[]): Promise<string> {
    throw new Error('not implemented');
  }
  value: Promise<string> = Promise.resolve('');
  get accessor(): Promise<string> {
    throw new Error('not implemented');
  }
}
