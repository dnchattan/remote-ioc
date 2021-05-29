import 'reflect-metadata';
// eslint-disable-next-line import/no-cycle
import { getRuntime } from '../RuntimeContext';
import type { Constructor } from '../Types';

const ApiProviderDefinition = Symbol('api:provider:definition');

function ApiProviderDecorator<T extends Constructor>(definition: T) {
  return <U extends T>(target: U): U => {
    const runtime = getRuntime();
    runtime.registerProvider(target);
    const definitions = Reflect.getMetadata(ApiProviderDefinition, target) || [];
    Reflect.defineMetadata(ApiProviderDefinition, [...definitions, definition], target);
    return target;
  };
}

export interface IApiProviderDecorator {
  <T extends Constructor>(definition: T): <U extends T>(target: U) => U;
  implementationsOf<U extends Constructor>(target: U): Constructor[];
}

export const ApiProvider: IApiProviderDecorator = Object.assign(ApiProviderDecorator, {
  implementationsOf<U extends Constructor>(target: U): Constructor[] {
    const definitions = Reflect.getMetadata(ApiProviderDefinition, target);
    if (definitions === undefined) {
      throw new Error(`Target class '${target.name}' is not marked with @ApiProvider`);
    }
    return definitions;
  },
});
