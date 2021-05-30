const { useApi, useRouter, ApiProvider } = require('@remote-ioc/runtime');
const { contextBridge } = require('electron');
const { ElectronRouter } = require('../../lib');
const { IMainApi, IRendererApi } = require('./Shared');

const mainApi = useApi(IMainApi);
let completeCallback;
function onTestComplete(callback) {
  completeCallback = callback;
}

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

function exposeApi(api) {
  const result = {};
  console.log({ api });
  const proto = Object.getPrototypeOf(api);
  console.log({ proto });
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor' || typeof api[key] !== 'function') {
      continue;
    }
    result[key] = api[key].bind(api);
  }
  return result;
}

contextBridge.exposeInMainWorld('MainApi', exposeApi(mainApi));
contextBridge.exposeInMainWorld('onTestComplete', onTestComplete);
