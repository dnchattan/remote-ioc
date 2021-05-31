import { AsyncMessage } from './AsyncMessage';

export interface GetPropertyValue extends AsyncMessage {
  propertyName: string;
}
