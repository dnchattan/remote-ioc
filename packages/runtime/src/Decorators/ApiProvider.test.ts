/* eslint-disable max-classes-per-file */
import { useRuntime } from '../RuntimeContext';
import { ApiDefinition } from './ApiDefinition';
import { ApiProvider } from './ApiProvider';

describe('@ApiProvider', () => {
  it('typical class', () => {
    class Provider {}
    expect(() => ApiProvider.implementationsOf(Provider)).toThrowError(
      `Target class 'Provider' is not marked with @ApiProvider`
    );
  });
  it('decorated class', () => {
    const runtime = { registerProvider: jest.fn(), getProvider: jest.fn() };
    useRuntime(runtime, () => {
      @ApiDefinition('my-api')
      class Definition {}
      @ApiProvider(Definition)
      class Provider {}
      expect(ApiProvider.implementationsOf(Provider)).toEqual([Definition]);
      expect(runtime.registerProvider).toBeCalledWith(Provider, Definition);
    });
  });
  it('multiple decorators', () => {
    const runtime = { registerProvider: jest.fn(), getProvider: jest.fn() };
    useRuntime(runtime, () => {
      @ApiDefinition('my-api-1')
      class Definition1 {}
      @ApiDefinition('my-api-2')
      class Definition2 {}
      @ApiProvider(Definition1)
      @ApiProvider(Definition2)
      class Provider {}
      expect(ApiProvider.implementationsOf(Provider)).toEqual([Definition2, Definition1]);
      expect(runtime.registerProvider).toHaveBeenNthCalledWith(1, Provider, Definition2);
      expect(runtime.registerProvider).toHaveBeenNthCalledWith(2, Provider, Definition1);
    });
  });
});
