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

      useRouter(LocalRouter);
    }
    function importApp() {
      async function app() {
        const { IGreeter } = importDefinition();
        const greeter = useApi(IGreeter);
        const message = await greeter.greet('world');
        logResult(message);
      }
      return { app };
    }

    useRuntime(new Runtime(), importProvider);
    const { app } = useRuntime(new Runtime(), importApp);
    await app();
    expect(logResult).toHaveBeenCalledWith('Hello, world!');
  });
});