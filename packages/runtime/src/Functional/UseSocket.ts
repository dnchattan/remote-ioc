import { IPCSocket } from '../Interfaces';
import { getDefaultRuntime, Runtime } from '../Runtime';

export function useSocket<T extends IPCSocket>(socket: T, runtime: Runtime = getDefaultRuntime()): T {
  runtime.connect(socket);
  return socket;
}
