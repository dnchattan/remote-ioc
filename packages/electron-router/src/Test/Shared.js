const { ApiDefinition, methodStub } = require('@remote-ioc/runtime');

class ITestApi {
  method() {
    methodStub(this);
  }
}

module.exports = {
  ITestApi: ApiDefinition('test-api')(ITestApi),
};
