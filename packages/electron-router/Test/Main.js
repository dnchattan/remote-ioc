const { ApiProvider, useRouter, useApi, useCallingContext } = require('@remote-ioc/runtime');
const { app, BrowserWindow } = require('electron');
const { ElectronRouter } = require('../lib');
const path = require('path');
const { IMainApi, IRendererApi } = require('./Shared');

let data = undefined;
function receiveData(value) {
  data = value;
}

class MainApi {
  async sendData(value) {
    receiveData(value);
  }
  async done() {
    if (data !== 'foo' || useCallingContext(this) === undefined) {
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
    app.quit();
  }
}

ApiProvider(IMainApi)(MainApi);
useRouter(ElectronRouter);

async function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
    },
    show: false,
  });
  mainWindow.loadURL(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => {
    useApi(IRendererApi).sendData('foo');
    // mainWindow.show();
  });
}

app.on('ready', createWindow);
