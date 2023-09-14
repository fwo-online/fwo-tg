import { cloneDeep } from 'lodash';
import type { HealNext } from '@/arena/Constuructors/HealMagicConstructor';
import type { LongDmgMagicNext } from '@/arena/Constuructors/LongDmgMagicConstructor';
import type { LongMagicNext } from '@/arena/Constuructors/LongMagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import { floatNumber } from '@/utils/floatNumber';
import type { Message } from '../LogService';

export function joinHealMessages(messages: Message[], newMessage: HealNext): Message[] {
  const copy = cloneDeep(messages);

  for (const message of copy) {
    if (isSameMessage(message, newMessage, { ignoreInitiator: true })) {
      message.expArr.push(...newMessage.expArr);
      message.effect = floatNumber(message.effect + newMessage.effect);
      return copy;
    }
  }

  copy.push(newMessage);
  return copy;
}

export function joinLongMessages(messages: Message[], newMessage: LongMagicNext): Message[] {
  const copy = cloneDeep(messages);

  for (const message of copy) {
    if (isSameMessage(message, newMessage)) {
      message.exp = floatNumber(message.exp + newMessage.exp);
      return copy;
    }
  }

  copy.push(newMessage);
  return copy;
}

export function joinLongDmgMessages(messages: Message[], newMessage: LongDmgMagicNext): Message[] {
  const copy = cloneDeep(messages);

  for (const message of copy) {
    if (isSameMessage(message, newMessage)) {
      message.exp = floatNumber(message.exp + newMessage.exp);
      message.dmg = floatNumber(message.dmg + newMessage.dmg);
      message.hp = Math.min(message.hp, newMessage.hp);
      return copy;
    }
  }

  copy.push(newMessage);
  return copy;
}

type IsSameMessageOptions = {
  ignoreTarget?: boolean
  ignoreInitiator?: boolean
}
function isSameMessage<T extends SuccessArgs>(
  a: Message,
  b: T,
  options?: IsSameMessageOptions,
): a is T {
  return a.action === b.action
    && a.actionType === b.actionType
    && (options?.ignoreInitiator ? true : a.initiator === b.initiator)
    && (options?.ignoreTarget ? true : a.target === b.target)
    && isSuccessResult(a);
}
