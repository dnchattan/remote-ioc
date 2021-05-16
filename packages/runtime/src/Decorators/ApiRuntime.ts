import 'reflect-metadata';
import { getDefaultRuntime, Runtime } from '../Runtime';
import type { Constructor } from '../Types';
import { MetadataKeys } from './State';

export const ApiRuntime = (runtime: Runtime) => <U extends Constructor>(target: U): U => {
  const currentRuntime = Reflect.getMetadata(MetadataKeys.runtime, target);
  if (currentRuntime) {
    if (currentRuntime !== runtime) {
      throw new Error('Cannot redefine runtime');
    } else {
      // eslint-disable-next-line no-console
      console.warn('Runtime redefined, is it possible it was inherited from a base class?');
    }
  }

  Reflect.metadata(MetadataKeys.runtime, runtime)(target);
  return target;
};

/**
 * Gets the runtime for a given class. Throws if not set
 * @param target Target class
 * @returns Runtime
 */
export function getRuntime<U extends Constructor>(target: U): Runtime {
  const runtime = Reflect.getMetadata(MetadataKeys.runtime, target);
  if (!runtime) {
    throw new Error('Runtime not set!');
  }
  return runtime;
}

export function bindToRuntime<U extends Constructor>(target: U): Runtime {
  let runtime = Reflect.getMetadata(MetadataKeys.runtime, target);
  if (!runtime) {
    runtime = getDefaultRuntime();
    ApiRuntime(runtime)(target);
  }
  return runtime;
}
