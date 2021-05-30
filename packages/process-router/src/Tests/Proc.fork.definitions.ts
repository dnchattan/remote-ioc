/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { ApiDefinition, methodStub } from '@remote-ioc/runtime';

@ApiDefinition('fork-worker-1')
export class IForkWorker1 {
  async identity(): Promise<string> {
    methodStub(this);
  }
  async method(): Promise<string> {
    methodStub(this);
  }
  async methodWithParams(..._value: number[]): Promise<string> {
    methodStub(this, _value);
  }
  value: Promise<string> = Promise.resolve('');
  get accessor(): Promise<string> {
    return methodStub(this);
  }
}

@ApiDefinition('fork-worker-2')
export class IForkWorker2 {
  async identity(): Promise<string> {
    methodStub(this);
  }
}
