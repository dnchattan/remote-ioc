import { Runtime } from './Runtime';
import { getRuntime, resetRuntime, useRuntime } from './RuntimeContext';

describe('RuntimeContext', () => {
  describe('resetRuntime', () => {
    it('uninitialized', () => {
      resetRuntime();
    });
    it('initialized', () => {
      getRuntime();
      resetRuntime();
    });
    it('in scope', () => {
      expect(() => useRuntime(new Runtime(), resetRuntime)).toThrowError(
        'Cannot reset runtime within a useRuntime scope'
      );
    });
  });
});
