/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { ApiConsumer, ApiDefinition, ApiProvider, ApiRuntime, ApiSocket, Runtime } from '@remote-ioc/runtime';
import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { ClientSocket } from '../ClientSocket';
import { ServerSocket } from '../ServerSocket';

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
  const runtimes: Set<Runtime> = new Set();

  beforeEach(() => {
    server = new Server();
    server.listen(9090);
  });

  afterEach(() => {
    server.close();
    server.disconnectSockets();
    for (const runtime of runtimes.values()) {
      runtime.close();
    }
    runtimes.clear();
  });

  it('method(void): Promise<string>', async () => {
    {
      const serverRuntime = new Runtime();
      runtimes.add(serverRuntime);

      @ApiDefinition('fork-worker')
      @ApiRuntime(serverRuntime)
      class IForkWorker extends IForkWorkerBase {}

      @ApiProvider(IForkWorker)
      @ApiRuntime(serverRuntime)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class ForkWorker implements IForkWorker {
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

      @ApiSocket(ServerSocket, server)
      @ApiRuntime(serverRuntime)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class ServerInstance {}
    }
    const clientInstance = (() => {
      const clientRuntime = new Runtime();
      runtimes.add(clientRuntime);

      @ApiDefinition('fork-worker')
      @ApiRuntime(clientRuntime)
      class IForkWorker extends IForkWorkerBase {}

      @ApiSocket(ClientSocket, io('http://localhost:9090', { reconnectionDelay: 0, forceNew: true }))
      @ApiRuntime(clientRuntime)
      class ClientInstance {
        @ApiConsumer public static worker: IForkWorker;
      }
      return ClientInstance;
    })();
    expect(await clientInstance.worker.method()).toEqual('async-return');
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
