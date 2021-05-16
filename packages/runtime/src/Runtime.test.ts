/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { v4 } from 'uuid';
import { ApiDefinition, ApiProvider, ApiRuntime } from './Decorators';
import { Runtime } from './Runtime';
import { InProcSocket } from './Tests/InProcSocket';
import { createSocketMock } from './Tests/MockSocket';

describe('Runtime', () => {
  it('getDefinition', () => {
    const runtime = new Runtime();
    @ApiDefinition('def')
    @ApiRuntime(runtime)
    class Test {
      method1(): Promise<void> {
        throw new Error();
      }
    }
    expect(runtime.getDefinition('def')).toBe(Test);
  });

  it('getDefinition missing', () => {
    const runtime = new Runtime();
    expect(runtime.getDefinition('def')).toBeUndefined();
  });

  describe('registerProvider', () => {
    it('before connect()', () => {
      const socket = createSocketMock();
      const runtime = new Runtime();
      @ApiDefinition('def')
      @ApiRuntime(runtime)
      class Test {
        method1(): Promise<void> {
          throw new Error();
        }
      }
      @ApiProvider(Test)
      // @ApiRuntime(runtime) // inherited from Test
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestImpl extends Test {}

      runtime.connect(socket);
      expect(socket.send).toBeCalledWith('$runtime', 'discover', {
        id: expect.any(String),
        provides: ['def'],
      });
    });
    it('after connect()', () => {
      const remoteId = v4();
      const remoteSocket = createSocketMock();
      remoteSocket.on = jest.fn((_scope, channel, callback) => {
        if (channel !== 'discover') {
          return;
        }
        callback({
          id: remoteId,
          provides: [],
        });
      });

      const socket = createSocketMock();
      const runtime = new Runtime();
      @ApiDefinition('def')
      @ApiRuntime(runtime)
      class Test {
        method1(): Promise<void> {
          throw new Error();
        }
      }
      runtime.connect(remoteSocket);
      runtime.connect(socket);
      expect(socket.send).toBeCalledWith('$runtime', 'discover', {
        id: expect.any(String),
        provides: [],
      });

      @ApiProvider(Test)
      // @ApiRuntime(runtime) // inherited from Test
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestImpl extends Test {}

      expect(socket.send).toBeCalledWith('$runtime', 'discover', {
        id: expect.any(String),
        provides: [],
      });
    });
  });
  describe('discover', () => {
    it('from socket', () => {
      const id = v4();
      const defName = v4();
      const socket = createSocketMock();
      const runtime = new Runtime();
      socket.on = jest.fn((_scope, channel, callback) => {
        if (channel !== 'discover') {
          return;
        }
        callback({
          id,
          provides: [defName],
        });
      });
      runtime.connect(socket);
      expect(socket.on).toBeCalledWith('$runtime', 'discover', expect.any(Function));
    });
  });
  it('import', async () => {
    const local = new Runtime();
    const remote = new Runtime();
    const socket = new InProcSocket();
    function register(runtime: Runtime) {
      @ApiDefinition('def')
      @ApiRuntime(runtime)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Def {
        method1(): Promise<string> {
          throw new Error();
        }
      }
      return Def;
    }
    const localDef = register(local);
    const remoteDef = register(remote);

    @ApiProvider(remoteDef)
    @ApiRuntime(remote)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class DefImpl {
      method1() {
        return 'test';
      }
    }

    local.connect(socket);
    remote.connect(socket);
    const api = await local.getProvider(localDef);
    expect(await api.method1()).toEqual('test');
  });
});
