export function hasEvents(
  Definition: any
): Definition is {
  off(eventName: string, handler: (message: any, context?: unknown) => void): typeof Definition;
  on(eventName: string, handler: (message: any, context?: unknown) => void): typeof Definition;
} {
  const targets = [Definition, Definition.prototype].filter(Boolean);
  return targets.some(
    (target) => !!(target.on && typeof target.on === 'function' && target.off && typeof target.off === 'function')
  );
}
