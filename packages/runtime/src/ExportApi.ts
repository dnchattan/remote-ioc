import { ApiExport } from './ApiExport';
import { IPCSocket } from './Interfaces';
import type { Runtime } from './Runtime';
import { Constructor } from './Types';

export function exportApi<T>(runtime: Runtime, definition: Constructor<T>, uid: string, socket: IPCSocket): void {
  // eslint-disable-next-line no-new
  new ApiExport(runtime, definition, uid, socket);
}
