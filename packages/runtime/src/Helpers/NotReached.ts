import callsites from 'callsites';

export function notReached(msg: string, ..._ignore: any[]): never {
  const caller = callsites()[1];
  throw new Error(`${msg} at [${caller.getTypeName()}.${caller.getFunctionName()}]`);
}
