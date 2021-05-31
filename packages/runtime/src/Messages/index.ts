import { CallMethod } from './CallMethod';
import { GetPropertyValue } from './GetPropertyValue';
import { SendEvent } from './SendEvent';
import { SetPromise } from './SetPromise';
import { SubscriptionMessage } from './SubscriptionMessage';

export * from './CallMethod';
export * from './GetPropertyValue';
export * from './SendEvent';
export * from './SetPromise';
export * from './SubscriptionMessage';

export type ServerMessages = {
  'set-promise': SetPromise;
  'send-event': SendEvent;
};

export type ClientMessages = {
  call: CallMethod;
  get: GetPropertyValue;
  sub: SubscriptionMessage;
  unsub: SubscriptionMessage;
};
