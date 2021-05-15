import { ApiExport } from './ApiExport';
import { IPCSocket } from './Interfaces';

export function exportApi<T extends {}>(api: T, uid: string, socket: IPCSocket): void {
  // eslint-disable-next-line no-new
  new ApiExport(api, uid, socket);
}
