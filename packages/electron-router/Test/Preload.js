const { useApi, useRouter, ApiProvider } = require('@remote-ioc/runtime');
const { contextBridge } = require('electron');
const { ElectronRouter, preloadApi } = require('../lib');
const { IMainApi, IRendererApi } = require('./Shared');

const mainApi = useApi(IMainApi);
let completeCallback;
function onTestComplete(callback) {
  completeCallback = callback;
}
contextBridge.exposeInMainWorld('onTestComplete', onTestComplete);

let data = undefined;
class RendererApi {
  sendData(value) {
    data = value;
    mainApi.sendData(data);
    completeCallback();
    return Promise.resolve();
  }
}
ApiProvider(IRendererApi)(RendererApi);

useRouter(ElectronRouter);
preloadApi('MainApi', IMainApi);
