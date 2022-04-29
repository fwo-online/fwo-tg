import type { HealNext } from '@/arena/Constuructors/HealMagicConstructor';
import type { LogMessage } from '../types';
import { partitionAction } from './partition-action';

type HealNextSuccess = HealNext & {__success: true};

function sumNextParams(msgObj: HealNextSuccess[]): LogMessage[] {
  const messages = msgObj.reduce((sum, curr) => {
    const { target } = curr;
    if (!sum[target]) {
      sum[target] = curr;
    } else {
      sum[target] = {
        ...sum[target],
        expArr: [...sum[target].expArr, ...curr.expArr],
        effect: sum[target].effect + curr.effect,
      };
    }
    return sum;
  }, {} as Record<string, HealNextSuccess>);
  return Object.values(messages);
}

export function joinHealMessages(messages: LogMessage[]): LogMessage[] {
  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i];
    if (message.__success && message.actionType === 'heal') {
      const [
        withAction,
        withoutAction,
      ] = partitionAction(messages, message);

      const sumMsgObj = sumNextParams(withAction);

      return joinHealMessages(withoutAction.splice(i, 0, ...sumMsgObj));
    }
  }
  return messages;
}
