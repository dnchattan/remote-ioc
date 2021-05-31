/* eslint-disable global-require */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { Runtime, useRuntime } from '@remote-ioc/runtime';

export class IForkWorkerBase {
  async method(): Promise<string> {
    throw new Error('not implemented');
  }
}

describe('node-ipc-router', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('client/server', async () => {
    // server
    useRuntime(new Runtime(), () => {
      const { ApiDefinition, ApiProvider, useRouter } = require('@remote-ioc/runtime');
      const { NodeIpcServerRouter } = require('../NodeIpcServerRouter');

      const IForkWorker = ApiDefinition('fork-worker')(IForkWorkerBase);

      @ApiProvider(IForkWorker)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class ForkWorker implements IForkWorkerBase {
        async method(): Promise<string> {
          return 'async-return';
        }
      }

      useRouter(NodeIpcServerRouter, 'test');
    });
    // client
    const methodResult = useRuntime(new Runtime(), () => {
      const { ApiDefinition, useRouter, useApi } = require('@remote-ioc/runtime');
      const { NodeIpcClientRouter } = require('../NodeIpcClientRouter');

      const IForkWorker = ApiDefinition('fork-worker')(IForkWorkerBase);

      useRouter(NodeIpcClientRouter, 'test');

      return useApi(IForkWorker).method();
    });
    await expect(methodResult).resolves.toEqual('async-return');
  });
});
