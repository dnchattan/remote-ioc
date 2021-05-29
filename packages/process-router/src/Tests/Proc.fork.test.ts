import { useApi, useRouter } from '@remote-ioc/runtime';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import { ProcessRouter } from '../ProcessSocket';
import { IForkWorker } from './Proc.fork.definitions';

export async function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

describe('process.fork', () => {
  let childProcess: ChildProcess;

  beforeEach(() => {
    childProcess = fork(path.join(__dirname, './Proc.fork.worker.ts'), [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      execArgv: ['-r', 'ts-node/register'],
      env: {
        ...process.env,
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
    });
  });

  afterEach(() => {
    childProcess.kill();
  });

  it('method(void): Promise<string>', async () => {
    useRouter(ProcessRouter, childProcess);
    expect(await useApi(IForkWorker).method()).toEqual('async-return');
  });

  // it('method(...number): Promise<string>', async () => {
  //   const apiProxy = await importApi<TestApi_A>('test-api', pipe);
  //   expect(await apiProxy.methodWithParams(1)).toEqual('async-return(1)');
  //   expect(await apiProxy.methodWithParams(1, 2)).toEqual('async-return(1, 2)');
  // });

  // it('property: Promise<string>', async () => {
  //   const apiProxy = await importApi<TestApi_A>('test-api', pipe);
  //   expect(await apiProxy.value).toEqual('value-property');
  // });

  // it('get property(): Promise<string>', async () => {
  //   const apiProxy = await importApi<TestApi_A>('test-api', pipe);
  //   expect(await apiProxy.accessor).toEqual('accessor-property');
  // });
});
