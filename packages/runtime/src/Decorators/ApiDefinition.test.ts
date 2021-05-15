/* eslint-disable max-classes-per-file */
import { ApiDefinition, getApiDefinition } from './ApiDefinition';

describe('@ApiDefinition', () => {
  it('undecorated', () => {
    class Test {}
    expect(getApiDefinition(Test)).toBeUndefined();
  });

  it('abstract class', () => {
    @ApiDefinition('abstract-class')
    abstract class Test {}
    expect(getApiDefinition(Test)).toEqual('abstract-class');
  });

  it('concrete class', () => {
    @ApiDefinition('concrete-class')
    class Test {}
    expect(getApiDefinition(Test)).toEqual('concrete-class');
  });

  it('name collision', () => {
    @ApiDefinition('collision-class')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {}

    expect(() => {
      @ApiDefinition('collision-class')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Test2 {}
    }).toThrowError(`Api definition already exists for the name 'collision-class'.`);
  });

  it('multiple on one target', () => {
    expect(() => {
      @ApiDefinition('class-1')
      @ApiDefinition('class-2')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Test {}
    }).toThrowError('Target already decorated with an @ApiDefintion');
  });
});
