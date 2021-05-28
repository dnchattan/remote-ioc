import { ApiDefinition } from '../@deprecated';

describe('@ApiDefinition', () => {
  it('is not constructable', () => {
    @ApiDefinition('my-api')
    class Definition {}
    expect(() => new Definition()).toThrow('');
  });
});
