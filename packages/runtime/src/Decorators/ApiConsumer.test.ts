/* eslint-disable max-classes-per-file */
import { Runtime } from '../Runtime';
import { InProcSocket } from '../InProcSocket';
import { ApiConsumer } from './ApiConsumer';
import { ApiDefinition } from './ApiDefinition';
import { ApiProvider } from './ApiProvider';
import { ApiRuntime } from './ApiRuntime';

describe('@ApiConsumer', () => {
  let testRuntime: Runtime = new Runtime();
  beforeEach(() => {
    testRuntime = new Runtime();
  });

  it('definition not registered', () => {
    class Definition1 {}
    @ApiRuntime(testRuntime)
    class Test {
      @ApiConsumer
      public readonly consumer!: Definition1;
    }
    expect(() => new Test().consumer).toThrow(`Type 'Definition1' does not have an @ApiDefinition decorator`);
  });

  it('no provider', async () => {
    @ApiDefinition('def')
    @ApiRuntime(testRuntime)
    class Definition1 {
      // eslint-disable-next-line class-methods-use-this
      method1() {
        return Promise.resolve('');
      }
    }
    @ApiRuntime(testRuntime)
    class Test {
      @ApiConsumer
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
    @ApiDefinition('def')
    @ApiRuntime(testRuntime)
    class Definition1 {
      // eslint-disable-next-line class-methods-use-this
      async method1() {
        throw new Error();
      }
    }

    @ApiProvider(Definition1)
    @ApiRuntime(testRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Definition1Impl {
      // eslint-disable-next-line class-methods-use-this
      async method1() {
        return 'test';
      }
    }

    @ApiRuntime(testRuntime)
    class Test {
      @ApiConsumer
      public readonly consumer!: Definition1;
    }
    expect(await new Test().consumer.method1()).toEqual('test');
  });

  it('with remote provider', async () => {
    const remoteRuntime = new Runtime();
    const socket = new InProcSocket();
    @ApiDefinition('def')
    @ApiRuntime(testRuntime)
    class DefinitionLocal {
      // eslint-disable-next-line class-methods-use-this
      async method1(): Promise<string> {
        throw new Error();
      }
    }

    @ApiDefinition('def')
    @ApiRuntime(remoteRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class DefinitionRemote {
      // eslint-disable-next-line class-methods-use-this
      async method1(): Promise<string> {
        throw new Error();
      }
    }

    @ApiProvider(DefinitionRemote)
    @ApiRuntime(remoteRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Definition1Impl {
      // eslint-disable-next-line class-methods-use-this
      async method1() {
        return 'test';
      }
    }

    testRuntime.connect(socket);
    remoteRuntime.connect(socket);

    @ApiRuntime(testRuntime)
    class Test {
      @ApiConsumer
      public readonly consumer!: DefinitionLocal;
    }
    expect(await new Test().consumer.method1()).toEqual('test');
  });
});
