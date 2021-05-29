import { AvailabilityMap } from './AvailabilityMap';

describe('AvailabilityMap', () => {
  it('request and resolve', async () => {
    const map = new AvailabilityMap<string, string>();
    const requestP = map.request('foo');
    map.resolve('foo', 'bar');
    expect(requestP).resolves.toEqual('bar');
  });
  it('resolve and request', async () => {
    const map = new AvailabilityMap<string, string>();
    map.resolve('foo', 'bar');
    const requestP = map.request('foo');
    expect(requestP).resolves.toEqual('bar');
  });
  it('reject and request', async () => {
    const map = new AvailabilityMap<string, string>();
    map.reject('foo', new Error('bar'));
    const requestP = map.request('foo');
    expect(requestP).rejects.toEqual(new Error('bar'));
  });
  it('request and reject', async () => {
    const map = new AvailabilityMap<string, string>();
    const requestP = map.request('foo');
    map.reject('foo', new Error('bar'));
    expect(requestP).rejects.toEqual(new Error('bar'));
  });
});
