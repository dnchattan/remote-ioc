const { ApiDefinition, methodStub } = require('@remote-ioc/runtime');

class IMainApi {
  sendData(value) {
    methodStub(this);
  }
  done() {
    methodStub(this);
  }
}

class IRendererApi {
  sendData(value) {
    methodStub(this);
  }
}

module.exports = {
  IMainApi: ApiDefinition('main-api')(IMainApi),
  IRendererApi: ApiDefinition('renderer-api')(IRendererApi),
};
