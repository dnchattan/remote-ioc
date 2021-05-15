/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { exportApi } from '../ExportApi';
import { importApi } from '../ImportApi';
import { IPCSocket } from '../Interfaces';
import { InProcSocket } from './InProcSocket';

describe('in-proc', () => {
  class TestApi_A {
    async method() {
      return 'async-return';
    }
    async methodWithParams(...value: number[]) {
      return `async-return(${value.join(', ')})`;
    }
    value = 'value-property';
    get accessor() {
      return 'accessor-property';
    }
  }
  class TestApi_B {
    async method() {
      return 'async-return-b';
    }
  }

  let pipe: IPCSocket;

  beforeEach(() => {
    pipe = new InProcSocket();
    exportApi(new TestApi_A(), 'test-api', pipe);
  });

  it('method(void): Promise<string>', async () => {
    const apiProxy = await importApi<TestApi_A>('test-api', pipe);
    expect(await apiProxy.method()).toEqual('async-return');
  });

  it('method(...number): Promise<string>', async () => {
    const apiProxy = await importApi<TestApi_A>('test-api', pipe);
    expect(await apiProxy.methodWithParams(1)).toEqual('async-return(1)');
    expect(await apiProxy.methodWithParams(1, 2)).toEqual('async-return(1, 2)');
  });

  it('property: Promise<string>', async () => {
    const apiProxy = await importApi<TestApi_A>('test-api', pipe);
    expect(await apiProxy.value).toEqual('value-property');
  });

  it('get property(): Promise<string>', async () => {
    const apiProxy = await importApi<TestApi_A>('test-api', pipe);
    expect(await apiProxy.accessor).toEqual('accessor-property');
  });

  it('multiple scopes', async () => {
    exportApi(new TestApi_B(), 'test-api-b', pipe);
    const apiProxyA = await importApi<TestApi_A>('test-api', pipe);
    const apiProxyB = await importApi<TestApi_B>('test-api-b', pipe);
    expect(await apiProxyA.method()).toEqual('async-return');
    expect(await apiProxyB.method()).toEqual('async-return-b');
  });
});
