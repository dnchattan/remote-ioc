/* eslint-disable max-classes-per-file */
import { methodStub } from './Decorators';
import { hasEvents } from './HasEvents';

describe('hasEvents()', () => {
  describe('=true', () => {
    class WithEvents {
      on(event: 'bonjour', handler: (name: string) => void): this {
        methodStub(this, event, handler);
      }
      off(event: 'bonjour', handler: (name: string) => void): this {
        methodStub(this, event, handler);
      }
    }
    it('constructor', () => expect(hasEvents(WithEvents)).toEqual(true));
    it('instance', () => expect(hasEvents(new WithEvents())).toEqual(true));
  });
  describe('=false', () => {
    class WithoutEvents {}
    it('constructor', () => expect(hasEvents(WithoutEvents)).toEqual(false));
    it('instance', () => expect(hasEvents(new WithoutEvents())).toEqual(false));
  });
});
