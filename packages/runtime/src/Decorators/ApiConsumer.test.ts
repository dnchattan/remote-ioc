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

  it('no provider', () => {
    @ApiDefinition('def', testRuntime)
    class Definition1 {}
    class Test {
      @ApiConsumer(testRuntime)
      public readonly consumer!: Definition1;
    }
    expect(() => new Test().consumer).toThrow(`Provider not found for 'def'`);
  });

  it('with local provider', () => {
    @ApiDefinition('def', testRuntime)
    class Definition1 {}

    @ApiProvider(Definition1, testRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Definition1Impl {}

    class Test {
      @ApiConsumer(testRuntime)
      public readonly consumer!: Definition1;
    }
    expect(() => new Test().consumer).not.toThrow();
  });

  it('with remote provider', () => {
    const remoteRuntime = new Runtime();
    const socket = new InProcSocket();
    @ApiDefinition('def', testRuntime)
    @ApiDefinition('def', remoteRuntime)
    class Definition1 {}

    @ApiProvider(Definition1, remoteRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Definition1Impl {}

    testRuntime.connect(socket);
    remoteRuntime.connect(socket);

    class Test {
      @ApiConsumer(testRuntime)
      public readonly consumer!: Definition1;
    }
    expect(() => new Test().consumer).not.toThrow();
  });
});
