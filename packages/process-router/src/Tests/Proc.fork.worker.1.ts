/* eslint-disable class-methods-use-this */
import { ApiProvider, useRouter } from '@remote-ioc/runtime';
import { ProcessRouter } from '../ProcessRouter';
import { IForkWorker1 } from './Proc.fork.definitions';

@ApiProvider(IForkWorker1)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ForkWorker1 implements IForkWorker1 {
  async identity(): Promise<string> {
    return '1';
  }
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
