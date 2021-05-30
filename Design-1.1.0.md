# New design

## Decorators

 * `@ApiDefinition(name: string)`
 * `@ApiProvider`
 * `@ApiAccessControl(fn: () => boolean)` - called before giving a reference to remote socket to control which sockets or clients are used


## Workflow

### Api Definition

```ts
// @greeter/definitions/src/index.ts
import { ApiDefinition, methodStub } from '@remote-ioc/runtime';

@ApiDefinition('greeter', '1.0.0')
class IGreeter {
  /**
   * Greets the user
   */
  greet(name: string): Promise<string> { methodStub(name); }
}
```

### Api Provider

```ts
// @greeter/api/src/index.ts
import { IGreeter } from '@greeter/definitions';
import { ApiProvider, LocalRouter } from '@remote-ioc/runtime';


@ApiProvider(IGreeter, '1.0.0')
class Greeter implements IGreeter {
  greet(name: string): Promise<string> {
    return `Hello, ${name}!`;
  }
}

useRouter(LocalRouter, { mode: 'server' });
```

### Api Consumer
```ts
// MyApp.ts
import { IGreeter } from '@greeter/definitions';
import { useApi, LocalRouter } from '@remote-ioc/runtime';

async function app() {
  const greeter = useApi(IGreeter); // IGreeter
  const message = await greeter.greet('world');
  console.log(message); // Hello, world!
}

useRouter(LocalRouter, { mode: 'client' });

app();
```