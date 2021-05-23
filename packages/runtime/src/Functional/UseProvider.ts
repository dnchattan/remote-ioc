import { Runtime, getDefaultRuntime } from '../Runtime';
import { Constructor, Promisify } from '../Types';

export function useProvider<U>(target: Constructor<U>, runtime: Runtime = getDefaultRuntime()): Promisify<U> {
  const instance = runtime.getProvider<U>(target);
  return instance;
}
