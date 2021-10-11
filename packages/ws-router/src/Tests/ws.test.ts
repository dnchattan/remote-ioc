/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { Runtime, useRuntime, ApiDefinition, useRouter, useApi } from '@remote-ioc/runtime';
import { WebSocket, Server } from 'isomorphic-ws';
import { WebSocketClientRouter } from '../WebSocketClientRouter';

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

type ExpectedMessage = [request: any, response?: (message: any) => any];

describe('ws', () => {
  async function useServer(messages: ExpectedMessage[]) {
    let onMessage = jest.fn();
    for (const message of messages) {
      const [request, response] = message;
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      onMessage = onMessage.mockImplementationOnce(function (this: WebSocket, data: Buffer) {
        const parsedData = JSON.parse(data.toString('utf8'));
        expect(parsedData).toEqual(request);
        if (response) {
          this.send(JSON.stringify(response(parsedData)));
        }
      });
    }
    const server = new Server({ port: 8080 });

    server.on('connection', (socket) => {
      socket.on('message', onMessage);
    });
    await new Promise<void>((resolve) => {
      server.on('listening', resolve);
    });
    return server;
  }

  it('method(void): Promise<string>', async () => {
    const server = await useServer([
      [['$router/discover', 'request', null, null], () => ['$router/discover', 'response', ['fork-worker'], null]],
      [
        ['fork-worker', 'call', { args: [], methodName: 'method', promiseId: expect.any(String) }, null],
        (msg) => ['fork-worker', 'set-promise', { success: true, promiseId: msg[2].promiseId, value: 'bar' }, null],
      ],
    ]);
    // client
    const socket = new WebSocket('ws://localhost:8080');
    const methodResult = await useRuntime(new Runtime(), async () => {
      const IForkWorker = ApiDefinition('fork-worker')(IForkWorkerBase);

      useRouter(WebSocketClientRouter, socket);

      return useApi(IForkWorker).method();
    });
    expect(methodResult).toEqual('bar');
    socket.close();
    server.close();
  });
});
