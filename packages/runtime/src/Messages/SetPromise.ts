import { AsyncMessage } from './AsyncMessage';

export interface ErrorInfo {
  message: string;
  errorTag?: any;
  stack?: any;
}

export interface SetFailedPromise extends AsyncMessage {
  success: false;
  error: ErrorInfo;
}

export interface SetSuccessfulPromise extends AsyncMessage {
  success: true;
  value?: any;
}

export type SetPromise = SetSuccessfulPromise | SetFailedPromise;
