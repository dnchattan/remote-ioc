import { exec } from 'child_process';
import path from 'path';

describe('Electron sample', () => {
  it('basic bi-directional flow', async () =>
    new Promise<void>((resolve) => {
      const cmd = `${require.resolve('.bin/electron.cmd')} ${path.join(__dirname, 'Main.js')}`;
      exec(cmd, { env: {} }, (err) => {
        expect(err).toBeNull();
        resolve();
      });
    }));
});
