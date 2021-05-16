/* eslint-disable max-classes-per-file */
import { Runtime } from '../Runtime';
import { ApiDefinition } from './ApiDefinition';
import { ApiProvider } from './ApiProvider';
import { getApiProviders, getApiProviderNames } from './getApiProviders';

describe('@ApiProvider', () => {
  let testRuntime: Runtime = new Runtime();
  beforeEach(() => {
    testRuntime = new Runtime();
  });

  it('undecorated', () => {
    class Test {}
    expect(getApiProviders(Test)).toEqual([]);
    expect(getApiProviderNames(Test)).toEqual([]);
  });

  it('abstract class', () => {
    @ApiDefinition('def-1', testRuntime)
    class Definition1 {}
    // @ts-expect-error
    @ApiProvider(Definition1, testRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    abstract class Test {}
  });

  it('concrete class', () => {
    @ApiDefinition('def-1', testRuntime)
    class Definition1 {}
    @ApiProvider(Definition1, testRuntime)
    class Test {}
    expect(getApiProviders(Test)).toEqual([Definition1]);
    expect(getApiProviderNames(Test)).toEqual(['def-1']);
  });

  it('multiple on one target', () => {
    @ApiDefinition('def-1', testRuntime)
    class Definition1 {}
    @ApiDefinition('def-2', testRuntime)
    abstract class Definition2 {}

    @ApiProvider(Definition1, testRuntime)
    @ApiProvider(Definition2, testRuntime)
    class Test {}
    expect(getApiProviders(Test)).toEqual([Definition2, Definition1]);
    expect(getApiProviderNames(Test)).toEqual(['def-2', 'def-1']);
  });
});
