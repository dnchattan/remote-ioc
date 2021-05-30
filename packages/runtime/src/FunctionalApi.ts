import { ApiDefinitionTarget } from './Decorators';
import type { IRouter } from './Interfaces';
import { getRuntime } from './RuntimeContext';
import type { Constructor, ConstructorWithArgs } from './Types';

export function useRouter<R extends ConstructorWithArgs<IRouter>>(
  RouterType: R,
  ...args: ConstructorParameters<R>
): InstanceType<R> {
  const router = new RouterType(...args) as InstanceType<R>;
  getRuntime().useRouter(router);
  return router;
}

export function useApi<D extends Constructor>(Definition: ApiDefinitionTarget<D>): InstanceType<D> {
  const api = getRuntime().getProvider(Definition);
  return api;
}
