import { AsyncMessage } from './AsyncMessage';

export interface CallMethod extends AsyncMessage {
  methodName: string;
  args: any[];
}
