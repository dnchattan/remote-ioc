/* eslint-disable max-classes-per-file */
import { generateMetadata } from './GenerateMetadata';
import { PropertyType } from './Interfaces';

/* eslint-disable class-methods-use-this */
describe('generateMetadata', () => {
  it('inheritance', () => {
    class Base {
      method1(): string {
        throw new Error();
      }
      get prop1(): string {
        throw new Error();
      }
    }
    class Derived extends Base {
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
