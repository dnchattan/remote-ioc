/* eslint-disable max-classes-per-file */
import { ApiDefinition } from './ApiDefinition';
import { ApiProvider, getApiProviders, getApiProviderNames } from './ApiProvider';
import { resetState } from './State';

describe('@ApiProvider', () => {
  @ApiDefinition('def-1')
  class Definition1 {}
  @ApiDefinition('def-2')
  abstract class Definition2 {}

  beforeEach(() => {
    resetState();
  });

  it('undecorated', () => {
    class Test {}
    expect(getApiProviders(Test)).toEqual([]);
    expect(getApiProviderNames(Test)).toEqual([]);
  });

  it('abstract class', () => {
    // @ts-expect-error
    @ApiProvider(Definition1)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    abstract class Test {}
  });

  it('concreate class', () => {
    @ApiProvider(Definition1)
    class Test {}
    expect(getApiProviders(Test)).toEqual([Definition1]);
    expect(getApiProviderNames(Test)).toEqual(['def-1']);
  });

  it('multiple on one target', () => {
    @ApiProvider(Definition1)
    @ApiProvider(Definition2)
    class Test {}
    expect(getApiProviders(Test)).toEqual([Definition2, Definition1]);
    expect(getApiProviderNames(Test)).toEqual(['def-2', 'def-1']);
  });
});
