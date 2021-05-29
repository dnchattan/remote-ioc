import { ApiDefinition } from '../Decorators';
import { Constructor } from '../Types';
import { AvailabilityMap } from './AvailabilityMap';

describe('AvailabilityMap', () => {
  @ApiDefinition('foo')
  class Definition {}
  it('request and resolve', async () => {
    const map = new AvailabilityMap<Constructor, string>();
    const requestP = map.request(Definition);
    map.resolve(Definition, 'bar');
    expect(requestP).resolves.toEqual('bar');
  });
  it('resolve and request', async () => {
    const map = new AvailabilityMap<Constructor, string>();
    map.resolve(Definition, 'bar');
    const requestP = map.request(Definition);
    expect(requestP).resolves.toEqual('bar');
  });
  it('reject and request', async () => {
    const map = new AvailabilityMap<Constructor, string>();
    map.reject(Definition, new Error('bar'));
    const requestP = map.request(Definition);
    expect(requestP).rejects.toEqual(new Error('bar'));
  });
  it('request and reject', async () => {
    const map = new AvailabilityMap<Constructor, string>();
    const requestP = map.request(Definition);
    map.reject(Definition, new Error('bar'));
    expect(requestP).rejects.toEqual(new Error('bar'));
  });
});
