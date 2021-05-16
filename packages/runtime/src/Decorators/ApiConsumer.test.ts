/* eslint-disable max-classes-per-file */
import { Runtime } from '../Runtime';
import { InProcSocket } from '../Tests/InProcSocket';
import { ApiConsumer } from './ApiConsumer';
import { ApiDefinition } from './ApiDefinition';
import { ApiProvider } from './ApiProvider';

describe('@ApiConsumer', () => {
  let testRuntime: Runtime = new Runtime();
  beforeEach(() => {
    testRuntime = new Runtime();
  });

  it('definition not registered', () => {
    class Definition1 {}
    class Test {
      @ApiConsumer(testRuntime)
      public readonly consumer!: Definition1;
    }
    expect(() => new Test().consumer).toThrow(`Type 'Definition1' does not have an @ApiDefinition decorator`);
  });

  it('no provider', async () => {
    @ApiDefinition('def', testRuntime)
    class Definition1 {
      // eslint-disable-next-line class-methods-use-this
      method1() {
        return Promise.resolve('');
      }
    }
    class Test {
      @ApiConsumer(testRuntime)
      public readonly consumer!: Definition1;
      // eslint-disable-next-line class-methods-use-this
      method1() {
        return Promise.resolve('test');
      }
    }
    // will not throw on access
    const test = new Test();
    // throws on first usage after resolving all pending sockets
    try {
      await test.consumer.method1();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('with local provider', async () => {
    @ApiDefinition('def', testRuntime)
    class Definition1 {
      // eslint-disable-next-line class-methods-use-this
      async method1() {
        throw new Error();
      }
    }

    @ApiProvider(Definition1, testRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Definition1Impl {
      // eslint-disable-next-line class-methods-use-this
      async method1() {
        return 'test';
      }
    }

    class Test {
      @ApiConsumer(testRuntime)
      public readonly consumer!: Definition1;
    }
    expect(await new Test().consumer.method1()).toEqual('test');
  });

  it('with remote provider', async () => {
    const remoteRuntime = new Runtime();
    const socket = new InProcSocket();
    @ApiDefinition('def', testRuntime)
    @ApiDefinition('def', remoteRuntime)
    class Definition1 {
      // eslint-disable-next-line class-methods-use-this
      async method1(): Promise<string> {
        throw new Error();
      }
    }

    @ApiProvider(Definition1, remoteRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Definition1Impl {
      // eslint-disable-next-line class-methods-use-this
      async method1() {
        return 'test';
      }
    }

    testRuntime.connect(socket);
    remoteRuntime.connect(socket);

    class Test {
      @ApiConsumer(testRuntime)
      public readonly consumer!: Definition1;
    }
    expect(await new Test().consumer.method1()).toEqual('test');
  });
});
