import { ProcessPipe } from '../Pipes/ProcessPipe';

class TestApi {
  async method() {
    return 'async-return';
  }
  async methodWithParams(...value: number[]) {
    return `async-return(${value.join(', ')})`;
  }
  value = 'value-property';
  get accessor() {
    return 'accessor-property';
  }
}

const pipe = new ProcessPipe(process);

exportApi(new TestApi(), 'test-api', pipe);
