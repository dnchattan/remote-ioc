/* eslint-disable max-classes-per-file */
import { ApiDefinition, methodStub } from './ApiDefinition';

describe('@ApiDefinition', () => {
  describe('errors', () => {
    it('is not constructable', () => {
      @ApiDefinition('my-api')
      class Definition {}
      expect(() => new Definition()).toThrowError(`Api definition 'Definition' is not constructable`);
    });

    it('nameOf typical class', () => {
      class Definition {}
      expect(() => ApiDefinition.nameOf(Definition)).toThrowError(
        `Target class 'Definition' is not marked with @ApiDefinition`
      );
    });

    it('multiple definitions', () => {
      expect(() => {
        @ApiDefinition('my-api-1')
        @ApiDefinition('my-api-2')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        class Definition {}
      }).toThrowError(`Target 'Definition' is already decorated with an @ApiDefintion`);
    });

    it('call method fails', () => {
      @ApiDefinition('my-api')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Definition {
        method(arg0: string, arg1: boolean): Promise<string> {
          methodStub(this, arg0, arg1);
        }
      }
      expect(Definition.prototype.method.bind(undefined, 'arg0', false)).toThrowError('Cannot call interface method');
    });

    it('enforce promise types', () => {
      // @ts-expect-error
      @ApiDefinition('my-api')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class SyncMethod {
        syncMethod(): string {
          methodStub(this);
        }
      }

      // @ts-expect-error
      @ApiDefinition('my-api')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class VoidMethod {
        voidMethod(): void {
          methodStub(this);
        }
      }

      // @ts-expect-error
      @ApiDefinition('my-api')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class SyncProperty {
        syncProperty: string = 'some-value';
      }
    });
  });

  describe('success', () => {
    it('multiple matching definitions', () => {
      // not sure if this is good to actually support, but... no reason not to I guess?
      @ApiDefinition('my-api')
      @ApiDefinition('my-api')
      class Definition {}
      expect(() => ApiDefinition.nameOf(Definition)).not.toThrow();
    });

    it('nameOf decorated class', () => {
      @ApiDefinition('my-api')
      class Definition {}
      expect(ApiDefinition.nameOf(Definition)).toEqual('my-api');
    });
  });
});
