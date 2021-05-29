/* eslint-disable max-classes-per-file */
import { ApiDefinition, methodStub } from '../Decorators';
import { ApiProvider } from '../Decorators/ApiProvider';
import { useApi, useRouter } from '../FunctionalApi';
import { LocalRouter } from '../LocalRouter';
import { Runtime } from '../Runtime';
import { useRuntime } from '../RuntimeContext';

class IGreeterDefinition {
  greet(name: string): Promise<string> {
    methodStub(this, name);
  }
}

describe('sample', () => {
  it('documentation sample', async () => {
    // TODO: This is a bit of a hack, testing with a shared LocalRouter which is not intended for this scenario.
    // This should ideally be changed to connect betweeen two router instances
    const logResult = jest.fn();
    function importDefinition() {
      return { IGreeter: ApiDefinition('greeter')(IGreeterDefinition) };
    }
    function importProvider() {
      const { IGreeter } = importDefinition();
      @ApiProvider(IGreeter)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Greeter implements IGreeterDefinition {
        // eslint-disable-next-line class-methods-use-this
        async greet(name: string): Promise<string> {
          return `Hello, ${name}`;
        }
      }
      useRouter(LocalRouter, 'provider');
    }
    function importApp() {
      async function app() {
        const { IGreeter } = importDefinition();
        useRouter(LocalRouter, 'consumer');
        const greeter = useApi(IGreeter);
        const message = await greeter.greet('world');
        logResult(message);
      }
      return { app };
    }

    useRuntime(new Runtime(), importProvider);
    const { app } = useRuntime(new Runtime(), importApp);
    await app();
    expect(logResult).toHaveBeenCalledWith('Hello, world');
  });
});
