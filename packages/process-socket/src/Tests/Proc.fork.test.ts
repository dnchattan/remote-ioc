import { importApi } from '../ImportApi';
import { ApiPipe } from '../Types';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import { ProcessPipe } from '../Pipes/ProcessPipe';

describe('process.fork', () => {
  let childProcess: ChildProcess;
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

  let pipe: ApiPipe;

  beforeEach(() => {
    childProcess = fork(path.join(__dirname, './Proc.fork.worker.ts'), [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      execArgv: ['-r', 'ts-node/register'],
      env: {
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
    });
    pipe = new ProcessPipe(childProcess);
  });

  afterEach(() => {
    pipe.close();
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
});
