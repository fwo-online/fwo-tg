import type { LongDmgMagicNext } from '@/arena/Constuructors/LongDmgMagicConstructor';
import { floatNumber } from '@/utils/floatNumber';
import type { LogMessage } from '../types';
import { partitionAction } from './partition-action';

type LongDmgMagicNextSussess = LongDmgMagicNext & {__success: true};
/**
 * Принимает массив сообщений длительной магии. Возвращает одно сообщение
 * с объединёнными характеристиками
 */
function sumNextParams(msgObj: LongDmgMagicNextSussess[]): LongDmgMagicNextSussess[] {
  const messagesByTarget: LongDmgMagicNextSussess[] = [];
  return msgObj.reduce((sum, curr) => {
    const index = sum.findIndex((val) => (
      val.initiator === curr.initiator && val.target === curr.target
    ));
    if (index !== -1) {
      const found = sum[index];
      sum[index] = {
        ...found,
        dmg: floatNumber(found.dmg + curr.dmg),
        hp: Math.min(found.hp, curr.hp),
        exp: floatNumber(found.exp + curr.exp),
      };
    } else {
      sum.push(curr);
    }
    return sum;
  }, messagesByTarget);
}

export function joinLongMessages(messages: LogMessage[]): LogMessage[] {
  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i];
    if (message.__success && message.actionType === 'dmg-magic-long') {
      const [
        withAction,
        withoutAction,
      ] = partitionAction(messages, message);

      const sumMsgObj = sumNextParams(withAction);

      return joinLongMessages(withoutAction.splice(i, 0, ...sumMsgObj));
    }
  }
  return messages;
}
