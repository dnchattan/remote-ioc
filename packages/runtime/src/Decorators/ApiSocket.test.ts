/* eslint-disable max-classes-per-file */
import { Runtime } from '../Runtime';
import { InProcSocket } from '../Tests/InProcSocket';
import { ApiRuntime } from './ApiRuntime';
import { ApiSocket } from './ApiSocket';

describe('@ApiSocket', () => {
  it('by ctor', () => {
    const runtime = ({
      connect: jest.fn(),
    } as unknown) as Runtime;
    @ApiSocket(InProcSocket)
    @ApiRuntime(runtime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {}
    expect(runtime.connect).toBeCalledWith(expect.any(InProcSocket));
  });

  it('by function', () => {
    const runtime = ({
      connect: jest.fn(),
    } as unknown) as Runtime;
    @ApiSocket(() => new InProcSocket())
    @ApiRuntime(runtime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {}
    expect(runtime.connect).toBeCalledWith(expect.any(InProcSocket));
  });

  it('unexpected throw', () => {
    const runtime = ({
      connect: jest.fn(),
    } as unknown) as Runtime;
    expect(() => {
      @ApiSocket(() => {
        throw new Error('expected-error');
      })
      @ApiRuntime(runtime)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class Test {}
    }).toThrow(new Error('expected-error'));
  });
});
