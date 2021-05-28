import 'reflect-metadata';
import type { Constructor, Promisify, StaticError } from '../Types';

export type ApiDefinitionError<T> = StaticError<'TypeError: all type members be async', T>;
export type ApiDefinitionTarget<T extends Constructor> = InstanceType<T> extends Promisify<InstanceType<T>>
  ? Promisify<InstanceType<T>> extends InstanceType<T>
    ? T
    : ApiDefinitionError<T>
  : ApiDefinitionError<T>;

const ApiDefinitionName = Symbol('api:definition:name');

interface IApiDefinitionWrapper<T extends Constructor> extends Constructor<InstanceType<T>> {
  readonly definitionClass: T;
}

function ApiDefinitionDecorator(name: string) {
  return <T extends Constructor>(target: ApiDefinitionTarget<T>): T => {
    const wrapper: IApiDefinitionWrapper<T> = ((target as any) as IApiDefinitionWrapper<T>).definitionClass
      ? target
      : (class ApiDefinitionWrapper extends (target as any) {
          private constructor() {
            super();
            throw new Error(`Api definition '${wrapper.definitionClass.name}' is not constructable`);
          }

          static get definitionClass() {
            return target;
          }
        } as any);

    const currentMetadata = Reflect.getMetadata(ApiDefinitionName, wrapper);
    if (currentMetadata && currentMetadata !== name) {
      throw new Error(`Target '${wrapper.definitionClass.name}' is already decorated with an @ApiDefintion`);
    }

    Reflect.defineMetadata(ApiDefinitionName, name, wrapper);
    return wrapper as any;
  };
}

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

export function methodStub(..._args: any[]): never {
  throw new Error('Cannot call interface method');
}
