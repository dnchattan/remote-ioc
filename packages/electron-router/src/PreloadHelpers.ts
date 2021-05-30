import { ApiDefinitionTarget, Constructor, useApi } from '@remote-ioc/runtime';
import { contextBridge } from 'electron';

function exposeApi<T>(api: T): T {
  const result: any = {};
  const proto = Object.getPrototypeOf(api);
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor' || typeof api[key as keyof T] !== 'function') {
      continue;
    }
    result[key] = ((api[key as keyof T] as unknown) as Function).bind(api);
  }
  return result as T;
}

export function preloadApi<D extends Constructor>(asName: string, Definition: ApiDefinitionTarget<D>): void {
  const api = useApi(Definition);
  contextBridge.exposeInMainWorld(asName, exposeApi(api));
}
