/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { ApiProvider, useRouter } from '@remote-ioc/runtime';
import { ProcessRouter } from '../ProcessSocket';
import { IForkWorker } from './Proc.fork.definitions';

@ApiProvider(IForkWorker)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ForkWorker implements IForkWorker {
  async method(): Promise<string> {
    return 'async-return';
  }
  async methodWithParams(...value: number[]): Promise<string> {
    return `async-return(${value.join(', ')})`;
  }
  value = Promise.resolve('value-property');
  get accessor(): Promise<string> {
    return Promise.resolve('accessor-property');
  }
}

useRouter(ProcessRouter, process);
