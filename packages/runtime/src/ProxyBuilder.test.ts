/* eslint-disable max-classes-per-file */
import { ApiDefinition, methodStub } from './Decorators';
import { useRouter } from './FunctionalApi';
import { IRouter, ISocket } from './Interfaces';
import { buildProxyFor } from './ProxyBuilder';
import { resetRuntime } from './RuntimeContext';

describe('ProxyBuilder', () => {
  class MockSocket implements ISocket {
    close = jest.fn();
    off = jest.fn();
    on = jest.fn();
    send = jest.fn();
  }

  class MockRouter implements IRouter {
    constructor();
    constructor(socket?: ISocket);
    constructor(private readonly socket: ISocket = new MockSocket()) {}
    getServer = jest.fn(() => this.socket);
    getSocket = jest.fn(() => this.socket);
    queryDefinition = jest.fn();
    registerProvider = jest.fn();
  }
  afterEach(() => {
    resetRuntime();
  });

  it('class name', () => {
    @ApiDefinition('my-api')
    class Definition {}
    const router = useRouter(MockRouter);
    const ProxyClass = buildProxyFor(Definition, Promise.resolve(router));
    expect(ProxyClass.name).toEqual('Proxy<my-api>');
  });

  it('method', async () => {
    @ApiDefinition('my-api')
    class Definition {
      method(arg0: string): Promise<string> {
        methodStub(this, arg0);
      }
    }
    const socket = new MockSocket();
    const router = useRouter(MockRouter, socket);
    router.queryDefinition.mockResolvedValue(true);
    socket.send.mockImplementationOnce((_scope: string, _channel: string, promiseId: string) => {
      const handler = socket.on.mock.calls[0][1];
      handler(promiseId, true, 'bar');
    });
    const ProxyClass = buildProxyFor(Definition, Promise.resolve(router));
    const proxy = new ProxyClass();
    await expect(proxy.method('foo')).resolves.toEqual('bar');
    expect(socket.send).toBeCalledWith('my-api', 'call', expect.any(String), 'method', 'foo');
    expect(router.getSocket).toBeCalledWith(Definition);
  });

  it('method:error', async () => {
    @ApiDefinition('my-api')
    class Definition {
      method(arg0: string): Promise<string> {
        methodStub(this, arg0);
      }
    }
    const socket = new MockSocket();
    const router = useRouter(MockRouter, socket);
    router.queryDefinition.mockResolvedValue(true);
    socket.send.mockImplementationOnce((_scope: string, _channel: string, promiseId: string) => {
      const handler = socket.on.mock.calls[0][1];
      handler(promiseId, false, new Error('bar'));
    });
    const ProxyClass = buildProxyFor(Definition, Promise.resolve(router));
    const proxy = new ProxyClass();
    await expect(proxy.method('foo')).rejects.toThrowError(new Error('bar'));
    expect(socket.send).toBeCalledWith('my-api', 'call', expect.any(String), 'method', 'foo');
    expect(router.getSocket).toBeCalledWith(Definition);
  });

  it('property', async () => {
    @ApiDefinition('my-api')
    class Definition {
      get property(): Promise<string> {
        return methodStub(this);
      }
    }
    const socket = new MockSocket();
    const router = useRouter(MockRouter, socket);
    router.queryDefinition.mockResolvedValue(true);
    socket.send.mockImplementationOnce((_scope: string, _channel: string, promiseId: string) => {
      const handler = socket.on.mock.calls[0][1];
      handler(promiseId, true, 'bar');
    });
    const ProxyClass = buildProxyFor(Definition, Promise.resolve(router));
    const proxy = new ProxyClass();
    await expect(proxy.property).resolves.toEqual('bar');
    expect(socket.send).toBeCalledWith('my-api', 'get', expect.any(String), 'property');
    expect(router.getSocket).toBeCalledWith(Definition);
  });

  it('property:value', () => {
    @ApiDefinition('my-api')
    class Definition {}
    // @ts-ignore force invalid API shape
    Definition.prototype.property = 'foo';
    const router = useRouter(MockRouter);
    expect(() => buildProxyFor(Definition, Promise.resolve(router))).toThrowError(
      new Error(`Invalid property type 'string' for property 'property'`)
    );
  });

  it('property:error', async () => {
    @ApiDefinition('my-api')
    class Definition {
      get property(): Promise<string> {
        return methodStub(this);
      }
    }
    const socket = new MockSocket();
    const router = useRouter(MockRouter, socket);
    router.queryDefinition.mockResolvedValue(true);
    socket.send.mockImplementationOnce((_scope: string, _channel: string, promiseId: string) => {
      const handler = socket.on.mock.calls[0][1];
      handler(promiseId, false, new Error('bar'));
    });
    const ProxyClass = buildProxyFor(Definition, Promise.resolve(router));
    const proxy = new ProxyClass();
    await expect(proxy.property).rejects.toThrowError(new Error('bar'));
    expect(socket.send).toBeCalledWith('my-api', 'get', expect.any(String), 'property');
    expect(router.getSocket).toBeCalledWith(Definition);
  });
});
