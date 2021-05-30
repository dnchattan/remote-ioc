/* eslint-disable class-methods-use-this */
import { ApiProvider, useRouter } from '@remote-ioc/runtime';
import { ProcessRouter } from '../ProcessRouter';
import { IForkWorker2 } from './Proc.fork.definitions';

@ApiProvider(IForkWorker2)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ForkWorker2 implements IForkWorker2 {
  async identity(): Promise<string> {
    return '2';
  }
}

useRouter(ProcessRouter, process);
