/* eslint-disable max-classes-per-file */
import { generateMetadata } from './GenerateMetadata';
import { PropertyType } from './Interfaces';

/* eslint-disable class-methods-use-this */
describe('generateMetadata', () => {
  it('abstract class', () => {
    abstract class Test {
      method1(): string {
        throw new Error();
      }
      get prop1(): string {
        throw new Error();
      }
    }
    const metadata = generateMetadata(Test);
    expect(metadata).toEqual({
      props: {
        method1: PropertyType.Method,
        prop1: PropertyType.Accessor,
      },
      hasEvents: undefined,
    });
  });
  it('inheritance', () => {
    abstract class Base {
      method1(): string {
        throw new Error();
      }
      get prop1(): string {
        throw new Error();
      }
    }
    abstract class Derived extends Base {
      method1(): string {
        throw new Error();
      }
      method2(): string {
        throw new Error();
      }
    }
    const metadata = generateMetadata(Derived);
    expect(metadata).toEqual({
      props: {
        method1: PropertyType.Method,
        method2: PropertyType.Method,
        prop1: PropertyType.Accessor,
      },
      hasEvents: undefined,
    });
  });
});
