import { IRuntime } from './Interfaces';
import { Runtime } from './Runtime';

let rootRuntime: IRuntime | undefined;
let currentRuntime: IRuntime;

export function useRuntime<T>(runtime: IRuntime, withinScope: () => T): T {
  const originalRuntime = currentRuntime;
  try {
    currentRuntime = runtime;
    return withinScope();
  } finally {
    currentRuntime = originalRuntime;
  }
}

export function getRuntime(): IRuntime {
  if (currentRuntime) {
    return currentRuntime;
  }
  if (!rootRuntime) {
    rootRuntime = new Runtime();
  }
  return rootRuntime;
}

export function resetRuntime(): void {
  if (currentRuntime) {
    throw new Error('Cannot reset runtime within a useRuntime scope');
  }
  rootRuntime = undefined;
}
