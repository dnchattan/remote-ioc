import { Runtime } from './Runtime';
import { InProcSocket } from './Tests/InProcSocket';

describe('Runtime', () => {
  it('remote registers first', () => {
    const local = new Runtime();
    const bridge = new InProcSocket();
    const remote = new Runtime();
    local.connect(bridge);
    remote.connect(bridge);
  });
});
