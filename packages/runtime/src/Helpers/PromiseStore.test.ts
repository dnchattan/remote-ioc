import { PromiseStore } from './PromiseStore';

describe('PromiseStore', () => {
  it('resolve', async () => {
    const store = new PromiseStore();
    const [id, result] = store.create();
    store.resolve(id, 'success');
    expect(await result).toEqual('success');
  });
  it('reject', async () => {
    const store = new PromiseStore();
    const [id, result] = store.create();
    store.reject(id, 'failed');
    expect(await result.catch((e) => ({ error: e }))).toEqual({ error: 'failed' });
  });
  it('invalid id', () => {
    const store = new PromiseStore();
    expect(() => store.resolve('42', 'the answer')).toThrow();
    expect(() => store.reject('42', new Error())).toThrow();
  });
});
