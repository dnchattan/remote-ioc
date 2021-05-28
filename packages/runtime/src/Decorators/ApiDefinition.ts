import 'reflect-metadata';
import type { Constructor, Promisify, StaticError } from '../Types';

export type ApiDefinitionError<T> = StaticError<'TypeError: all type members be async', T>;
export type ApiDefinitionTarget<T extends Constructor> = InstanceType<T> extends Promisify<InstanceType<T>>
  ? Promisify<InstanceType<T>> extends InstanceType<T>
    ? T
    : ApiDefinitionError<T>
  : ApiDefinitionError<T>;

const ApiDefinitionName = Symbol('api:definition:name');

function ApiDefinitionDecorator(name: string) {
  return <T extends Constructor>(target: ApiDefinitionTarget<T>): T => {
    const wrapper: T = (target as any).isWrapper
      ? target
      : (class ApiDefinitionWrapper extends (target as any) {
          private constructor() {
            super();
            throw new Error('Api definitions are not constructable');
          }
        } as any);
    (wrapper as any).isWrapper = true;

    const currentMetadata = Reflect.getMetadata(ApiDefinitionName, wrapper);
    if (currentMetadata && currentMetadata !== name) {
      throw new Error(`Target already decorated with an @ApiDefintion`);
    }

    Reflect.defineMetadata(ApiDefinitionName, name, wrapper);
    return wrapper;
  };
}

Object.defineProperty(ApiDefinitionDecorator, 'nameOf', {
  value<T extends Constructor>(target: ApiDefinitionTarget<T>): string {
    const name = Reflect.getMetadata(ApiDefinitionName, target);
    if (name === undefined) {
      throw new Error(`Target class '${target.name}' is not marked with @ApiDefinition`);
    }
    return name;
  },
});

export interface IApiDefinitionDecorator {
  (name: string): <T extends Constructor>(target: ApiDefinitionTarget<T>) => T;
  nameOf<T extends Constructor>(target: ApiDefinitionTarget<T>): string;
}

export const ApiDefinition: IApiDefinitionDecorator = Object.assign(ApiDefinitionDecorator, {
  nameOf<T extends Constructor>(target: ApiDefinitionTarget<T>): string {
    const name = Reflect.getMetadata(ApiDefinitionName, target);
    if (name === undefined) {
      throw new Error(`Target class '${target.name}' is not marked with @ApiDefinition`);
    }
    return name;
  },
});
