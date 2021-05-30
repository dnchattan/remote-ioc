const { useApi, useRouter } = require('@remote-ioc/runtime');
const { contextBridge } = require('electron');
const { ElectronRouter } = require('../../lib');
const { ITestApi } = require('./Shared');

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

contextBridge.exposeInMainWorld('TestApi', exposeApi(useApi(ITestApi)));
