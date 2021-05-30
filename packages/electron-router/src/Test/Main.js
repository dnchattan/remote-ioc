const { ApiProvider, useRouter } = require('@remote-ioc/runtime');
const { app, BrowserWindow } = require('electron');
const { ElectronRouter } = require('../../lib');
const path = require('path');
const { ITestApi } = require('./Shared');

class TestApi {
  async method() {
    return 'foo';
  }
}

ApiProvider(ITestApi)(TestApi);
useRouter(ElectronRouter);

async function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadURL(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.on('ready', createWindow);
