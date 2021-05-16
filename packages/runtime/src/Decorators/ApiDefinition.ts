import 'reflect-metadata';
import type { Constructor, InstanceOf, Promisify } from '../Types';
import { bindToRuntime } from './ApiRuntime';
import { MetadataKeys } from './State';

export type ApiDefinitionError<T> = 'TypeError: all type members be async' & T;

export const ApiDefinition = (name: string) => <T extends Constructor>(
  target: InstanceOf<T> extends Promisify<InstanceOf<T>>
    ? Promisify<InstanceOf<T>> extends InstanceOf<T>
      ? T
      : ApiDefinitionError<T>
    : ApiDefinitionError<T>
): T => {
  const runtime = bindToRuntime(target);
  const wrapper: T = (target as any).isWrapper
    ? target
    : (class ApiDefinitionWrapper extends (target as any) {
        private constructor() {
          super();
          throw new Error('Api definitions are not constructable');
        }
      } as any);
  (wrapper as any).isWrapper = true;

  const currentMetadata = Reflect.getMetadata(MetadataKeys.definition, wrapper);
  if (currentMetadata && currentMetadata !== name) {
    throw new Error(`Target already decorated with an @ApiDefintion`);
  }
  runtime.registerDefinition(name, wrapper as any);
  Reflect.metadata(MetadataKeys.definition, name)(wrapper as Function);
  return wrapper;
  // return target as any;
};
