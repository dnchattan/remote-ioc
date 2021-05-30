import { resetRuntime, useApi, useRouter } from '@remote-ioc/runtime';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import { ProcessRouter } from '../ProcessSocket';
import { IForkWorker1, IForkWorker2 } from './Proc.fork.definitions';

export async function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

describe('process.fork', () => {
  let childProcesses: ChildProcess[] = [];

  function createWorker(num: number) {
    const cp = fork(path.join(__dirname, `./Proc.fork.worker.${num}.ts`), [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      execArgv: ['-r', 'ts-node/register'],
      env: {
        ...process.env,
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
    });
    childProcesses.push(cp);
    return cp;
  }

  afterEach(() => {
    resetRuntime();
    childProcesses.forEach((cp) => cp.kill());
    childProcesses = [];
  });

  it('method(void): Promise<string>', async () => {
    const cp = createWorker(1);
    useRouter(ProcessRouter, cp);
    expect(await useApi(IForkWorker1).method()).toEqual('async-return');
  });

  it('multiple workers', async () => {
    const cp1 = createWorker(1);
    useRouter(ProcessRouter, cp1);
    const cp2 = createWorker(2);
    useRouter(ProcessRouter, cp2);
    expect(await useApi(IForkWorker1).identity()).toEqual('1');
    expect(await useApi(IForkWorker2).identity()).toEqual('2');
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
