/* eslint-disable max-classes-per-file */
import { Runtime } from '../Runtime';
import { ApiDefinition } from './ApiDefinition';
import { ApiRuntime } from './ApiRuntime';
import { getApiDefinitionName } from './getApiDefinitionName';

describe('@ApiDefinition', () => {
  const testRuntime = new Runtime();
  it('undecorated', () => {
    class Test {}
    expect(getApiDefinitionName(Test)).toBeUndefined();
  });

  it('construction fails', () => {
    @ApiDefinition('non-constructable')
    @ApiRuntime(testRuntime)
    class Test {}
    expect(() => new Test()).toThrow();
  });

  it('concrete class', () => {
    @ApiDefinition('concrete-class')
    @ApiRuntime(testRuntime)
    class Test {}
    expect(getApiDefinitionName(Test)).toEqual('concrete-class');
  });

  it('name collision', () => {
    @ApiDefinition('collision-class')
    @ApiRuntime(testRuntime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {}

    expect(() => {
      @ApiDefinition('collision-class')
      @ApiRuntime(testRuntime)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Test2 {}
    }).toThrowError(`Api definition already exists for the name 'collision-class'.`);
  });

  it('multiple on one target', () => {
    expect(() => {
      @ApiDefinition('class-1')
      @ApiDefinition('class-2')
      @ApiRuntime(testRuntime)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Test {}
    }).toThrowError('Target already decorated with an @ApiDefintion');
  });
});
