import _ from 'lodash';
import type { LogMessage } from '../types';

export function partitionAction<T extends LogMessage>(
  messages: readonly LogMessage[],
  msgObj: T,
): [T[], LogMessage[]] {
  return _.partition<LogMessage, T>(messages, (msg): msg is T => (
    msg.__success
  && msgObj.__success
  && msg.action === msgObj.action
  && msg.actionType === msgObj.actionType
  ));
}
