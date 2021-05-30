/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { Runtime, useRuntime } from '@remote-ioc/runtime';
import { Server } from 'socket.io';

export async function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export class IForkWorkerBase {
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

describe('socket.io', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
    server.listen(9090);
  });

  afterEach(() => {
    server.disconnectSockets();
    server.close();
    jest.resetModules();
  });

  it('method(void): Promise<string>', async () => {
    // server
    useRuntime(new Runtime(), () => {
      const { ApiDefinition, ApiProvider, useRouter } = require('@remote-ioc/runtime');
      const { SocketIOServerRouter } = require('../ServerRouter');

      const IForkWorker = ApiDefinition('fork-worker')(IForkWorkerBase);

      @ApiProvider(IForkWorker)
      class ForkWorker implements IForkWorkerBase {
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

      useRouter(SocketIOServerRouter, server);
    });
    // client
    const methodResult = useRuntime(new Runtime(), () => {
      const { Manager } = require('socket.io-client');
      const { ApiDefinition, useRouter, useApi } = require('@remote-ioc/runtime');
      const { SocketIOClientRouter } = require('../ClientRouter');

      const IForkWorker = ApiDefinition('fork-worker')(IForkWorkerBase);

      useRouter(
        SocketIOClientRouter,
        new Manager('http://localhost:9090', {
          pingTimeout: 60000,
          reconnectionDelay: 0,
          forceNew: true,
        })
      );

      return useApi(IForkWorker).method();
    });
    await expect(methodResult).resolves.toEqual('async-return');
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
