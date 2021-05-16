import { ApiProxy } from './ApiProxy';
import { DeferredValue } from './Helpers';
import type { IPCSocket } from './Interfaces';
import { createSocketMock, MockSocket } from './Tests/MockSocket';

describe('ApiProxy', () => {
  it('socket failed', async () => {
    const proxy = new ApiProxy('id', new DeferredValue<IPCSocket>(new Error('socket unavailable')));
    await expect(proxy.get('foo')).rejects.toEqual(new Error('socket unavailable'));
  });

  it('get()', async () => {
    const socket = new MockSocket();
    socket.handleSend(['id', 'get'], (id, _channel, pid) => socket.sendEvent(id, 'set-promise', pid, true, 'result'));
    const proxy = new ApiProxy('id', new DeferredValue<IPCSocket>(socket));
    await expect(proxy.get('foo')).resolves.toEqual('result');
  });

  it('call()', async () => {
    const socket = new MockSocket();
    socket.handleSend(['id', 'call'], (id, _channel, pid, _methodName, arg0) =>
      socket.sendEvent(id, 'set-promise', pid, true, { result: arg0 })
    );
    const proxy = new ApiProxy('id', new DeferredValue<IPCSocket>(socket));
    await expect(proxy.call('foo', 'bar')).resolves.toEqual({ result: 'bar' });
  });

  it('call(): Error', async () => {
    const socket = new MockSocket();
    socket.handleSend(['id', 'call'], (id, _channel, pid, _methodName) =>
      socket.sendEvent(id, 'set-promise', pid, false, new Error('failed-call'))
    );
    const proxy = new ApiProxy('id', new DeferredValue<IPCSocket>(socket));
    await expect(proxy.call('foo', 'bar')).rejects.toEqual(new Error('failed-call'));
  });

  it('on()', async () => {
    const socket = createSocketMock();
    const proxy = new ApiProxy('id', new DeferredValue<IPCSocket>(socket));
    proxy.on('foo', jest.fn());
    proxy.on('foo', jest.fn());
    // message is not blocking, so wait one tick
    await new Promise((resolve) => setTimeout(resolve, 1));
    expect(socket.send).toBeCalledTimes(1);
    expect(socket.send).toBeCalledWith('id', 'subscribe', 'foo');
  });

  it('off()', async () => {
    const socket = createSocketMock();
    const proxy = new ApiProxy('id', new DeferredValue<IPCSocket>(socket));
    const fn = jest.fn();
    proxy.on('foo', fn);
    proxy.on('foo', fn);
    proxy.off('foo', fn);
    proxy.off('foo', fn);
    // message is not blocking, so wait one tick
    await new Promise((resolve) => setTimeout(resolve, 1));
    expect(socket.send).toBeCalledTimes(2);
    expect(socket.send).toHaveBeenNthCalledWith(1, 'id', 'subscribe', 'foo');
    expect(socket.send).toHaveBeenNthCalledWith(2, 'id', 'unsubscribe', 'foo');
  });

  it('sendEvent()', async () => {
    const socket = new MockSocket();
    const proxy = new ApiProxy('id', new DeferredValue<IPCSocket>(socket));
    await new Promise((resolve) => setTimeout(resolve, 1));
    const fn = jest.fn();
    proxy.on('foo', fn);
    socket.sendEvent('id', 'send-event', 'foo', 'bar');
    expect(fn).toBeCalledWith('bar');
  });
});
