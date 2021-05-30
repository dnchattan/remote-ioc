import { notReached } from './NotReached';

describe('NotReached', () => {
  it('throws', () => {
    class Test {
      Method() {
        notReached('foo', this);
      }
    }
    expect(() => new Test().Method()).toThrowError(new Error('foo at [Test.Method]'));
  });
});
