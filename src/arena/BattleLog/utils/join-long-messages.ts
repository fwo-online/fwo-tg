import { cloneDeep } from 'lodash';
import type { LongDmgMagicNext } from '@/arena/Constuructors/LongDmgMagicConstructor';
import type { LongMagicNext } from '@/arena/Constuructors/LongMagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import type { Message } from '../BattleLog';

export function joinLongMessages(messages: Message[], newMessage: LongMagicNext): Message[] {
  const copy = cloneDeep(messages);

  for (const message of copy) {
    if (isSameMessage(message, newMessage)) {
      message.exp += newMessage.exp;
      return messages;
    }
  }

  messages.push(newMessage);
  return messages;
}

export function joinLongDmgMessages(messages: Message[], newMessage: LongDmgMagicNext): Message[] {
  const copy = cloneDeep(messages);

  for (const message of copy) {
    if (isSameMessage(message, newMessage)) {
      message.exp += newMessage.exp;
      message.dmg += newMessage.dmg;
      message.hp = Math.min(message.hp, newMessage.hp);
      return messages;
    }
  }

  messages.push(newMessage);
  return messages;
}

function isSameMessage<T extends SuccessArgs>(a: Message, b: T): a is T {
  return a.action === b.action
    && a.actionType === b.actionType
    && a.initiator === b.initiator
    && a.target === b.target
    && !('message' in a);
}
