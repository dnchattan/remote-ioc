import { ApiDefinitionTarget } from './Decorators';
import type { IRouter } from './Interfaces';
import { getRuntime } from './RuntimeContext';
import type { Constructor, ConstructorWithArgs } from './Types';

export function useRouter<R extends ConstructorWithArgs<IRouter>>(RouterType: R, ...args: ConstructorParameters<R>) {
  getRuntime().useRouter(new RouterType(...args));
}

export function useApi<D extends Constructor>(Definition: ApiDefinitionTarget<D>): InstanceType<D> {
  return getRuntime().getProvider(Definition);
}
