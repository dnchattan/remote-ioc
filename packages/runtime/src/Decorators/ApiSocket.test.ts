/* eslint-disable max-classes-per-file */
import { Runtime } from '../Runtime';
import { InProcSocket } from '../Tests/InProcSocket';
import { ApiRuntime } from './ApiRuntime';
import { ApiSocket } from './ApiSocket';

describe('@ApiSocket', () => {
  class InProcSocketWithArgs extends InProcSocket {
    constructor(public readonly arg0: string) {
      super();
    }
  }
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

  it('by ctor with args', () => {
    const runtime = ({
      connect: jest.fn(),
    } as unknown) as Runtime;
    @ApiSocket(InProcSocketWithArgs, 'foo')
    @ApiRuntime(runtime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {}
    expect(runtime.connect).toBeCalledWith(expect.any(InProcSocket));
    const [socket] = (runtime.connect as jest.Mock).mock.calls[0];
    expect(socket.arg0).toEqual('foo');
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

  it('by function with args', () => {
    const runtime = ({
      connect: jest.fn(),
    } as unknown) as Runtime;
    const fn = jest.fn((_arg0: string) => new InProcSocket());
    @ApiSocket(fn, 'foo')
    @ApiRuntime(runtime)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {}
    expect(runtime.connect).toBeCalledWith(expect.any(InProcSocket));
    expect(fn).toBeCalledWith('foo');
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
