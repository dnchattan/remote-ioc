export function hasEvents(
  Definition: any
): Definition is {
  off(eventName: string, handler: (...args: any[]) => void): typeof Definition;
  on(eventName: string, handler: (...args: any[]) => void): typeof Definition;
} {
  const targets = [Definition, Definition.prototype].filter(Boolean);
  return targets.some(
    (target) => !!(target.on && typeof target.on === 'function' && target.off && typeof target.off === 'function')
  );
}
