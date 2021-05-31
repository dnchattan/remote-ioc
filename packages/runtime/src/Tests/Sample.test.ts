/* eslint-disable max-classes-per-file */
import { EventEmitter } from 'events';
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
  notice(name: string): Promise<void> {
    methodStub(this, name);
  }
  on(event: 'bonjour', handler: (name: string) => void): this {
    methodStub(this, event, handler);
  }
  off(event: 'bonjour', handler: (name: string) => void): this {
    methodStub(this, event, handler);
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
      class Greeter extends EventEmitter implements IGreeterDefinition {
        // eslint-disable-next-line class-methods-use-this
        async greet(name: string): Promise<string> {
          return `Hello, ${name}`;
        }
        async notice(name: string): Promise<void> {
          this.emit('bonjour', name);
        }
      }
      useRouter(LocalRouter, 'provider');
    }
    function importApp() {
      async function app() {
        const { IGreeter } = importDefinition();
        useRouter(LocalRouter, 'consumer');
        const greeter = useApi(IGreeter);
        greeter.on('bonjour', (name) => logResult(`Bonjour, ${name}`));
        await greeter.notice('monde');
        const message = await greeter.greet('world');
        logResult(message);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return { app };
    }

    useRuntime(new Runtime(), importProvider);
    const { app } = useRuntime(new Runtime(), importApp);
    await app();
    expect(logResult).toHaveBeenNthCalledWith(1, 'Bonjour, monde');
    expect(logResult).toHaveBeenNthCalledWith(2, 'Hello, world');
  });
});
