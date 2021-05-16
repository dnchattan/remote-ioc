import { assert } from './Assert';

describe('assert', () => {
  it('success', () => expect(() => assert(true)).not.toThrow());
  it('false', () => expect(() => assert(false)).toThrow());
  it('falsy', () => expect(() => assert('', 'message')).toThrow('message'));
  it('type', () => expect(() => assert(false, RangeError)).toThrowError(RangeError));
  it('type+message', () => expect(() => assert(false, RangeError, 'message')).toThrow(new RangeError('message')));
});
