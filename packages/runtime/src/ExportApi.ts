import { ApiExport } from './ApiExport';
import { IPCSocket } from './Interfaces';
import { ConcreteConstructor } from './Types';

export function exportApi<T>(api: ConcreteConstructor<T>, uid: string, socket: IPCSocket): void {
  // eslint-disable-next-line no-new
  new ApiExport(api, uid, socket);
}
