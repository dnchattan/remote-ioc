import { Loopback } from './Loopback';

describe('loopback', () => {
  it('send/receive', () => {
    const loopback = new Loopback();
    const handler = jest.fn();
    loopback.on('0', '1', handler);
    loopback.send('0', '0', 'foo');
    loopback.send('1', '0', 'foo');
    expect(handler).not.toHaveBeenCalled();
    loopback.send('0', '1', 'foo');
    expect(handler).toHaveBeenCalledWith('foo');
    loopback.off('0', '0', handler);
    loopback.off('1', '0', handler);
    loopback.send('0', '1', 'foo');
    expect(handler).toHaveBeenCalledTimes(2);
    loopback.off('0', '1', handler);
    loopback.send('0', '1', 'foo');
    expect(handler).toHaveBeenCalledTimes(2);
  });

  describe('client/server', () => {
    it('send without subscriber', () => {
      const loopback = new Loopback();
      const serverA = loopback.createSocket('a');
      const clientA = loopback.createSocket('a');
      const handleAZ = jest.fn();
      clientA.on('z', handleAZ);
      serverA.send('y', 'foo');
      expect(handleAZ).not.toHaveBeenCalled();
    });

    it('send with subscriber', () => {
      const loopback = new Loopback();
      const serverA = loopback.createSocket('a');
      const clientA = loopback.createSocket('a');
      const handleAZ = jest.fn();
      clientA.on('z', handleAZ);
      serverA.send('z', 'foo');
      expect(handleAZ).toHaveBeenCalledWith('foo');
    });

    it('multiple clients', () => {
      const loopback = new Loopback();
      const serverA = loopback.createSocket('a');
      const clientA = loopback.createSocket('a');
      const handleAZ = jest.fn();
      clientA.on('z', handleAZ);
      const clientA2 = loopback.createSocket('a');
      const handleAZ2 = jest.fn();
      clientA2.on('z', handleAZ2);
      serverA.send('z', 'foo');
      expect(handleAZ).toHaveBeenCalledWith('foo');
      expect(handleAZ2).toHaveBeenCalledWith('foo');
    });

    it('remove listener', () => {
      const loopback = new Loopback();
      const serverA = loopback.createSocket('a');
      const clientA = loopback.createSocket('a');
      const clientA2 = loopback.createSocket('a');
      const handleAZ = jest.fn();
      const handleAZ2 = jest.fn();
      clientA.on('z', handleAZ);
      clientA2.on('z', handleAZ2);
      clientA.off('z', handleAZ);
      serverA.send('z', 'foo');
      expect(handleAZ).not.toHaveBeenCalled();
      expect(handleAZ2).toHaveBeenCalledWith('foo');
    });

    it('close client', () => {
      const loopback = new Loopback();
      const serverA = loopback.createSocket('a');
      const clientA = loopback.createSocket('a');
      const clientA2 = loopback.createSocket('a');
      const handleAZ = jest.fn();
      const handleAZ2 = jest.fn();
      clientA.on('z', handleAZ);
      clientA2.on('z', handleAZ2);
      clientA.close();
      serverA.send('z', 'foo');
      expect(handleAZ).not.toHaveBeenCalled();
      expect(handleAZ2).toHaveBeenCalledWith('foo');
    });
  });
});
