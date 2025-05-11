import type { SuccessArgs } from '@/arena/Constuructors/types';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import { floatNumber } from '@/utils/floatNumber';
import type { Message } from '../LogService';

function joinMessagesDuration(message: SuccessArgs, newMessage: SuccessArgs) {
  if (message.duration && newMessage.duration) {
    message.duration = Math.max(message.duration, newMessage.duration);
  }
}

export function joinHealMessages(messages: Message[], newMessage: SuccessArgs): Message[] {
  const copy = structuredClone(messages);

  for (const message of copy) {
    if (isSameMessage(message, newMessage, { ignoreInitiator: true })) {
      message.expArr.push(...newMessage.expArr);
      message.effect = floatNumber(message.effect + newMessage.effect);
      joinMessagesDuration(message, newMessage);
      return copy;
    }
  }

  copy.push(newMessage);
  return copy;
}

export function joinLongMessages(messages: Message[], newMessage: SuccessArgs): Message[] {
  const copy = structuredClone(messages);

  for (const message of copy) {
    if (isSameMessage(message, newMessage)) {
      message.exp = floatNumber(message.exp + newMessage.exp);
      joinMessagesDuration(message, newMessage);
      return copy;
    }
  }

  copy.push(newMessage);
  return copy;
}

export function joinLongDmgMessages(messages: Message[], newMessage: SuccessArgs): Message[] {
  const copy = structuredClone(messages);

  for (const message of copy) {
    if (isSameMessage(message, newMessage)) {
      message.exp = floatNumber(message.exp + newMessage.exp);
      message.effect = floatNumber(message.effect + newMessage.effect);
      message.hp = Math.min(message.hp, newMessage.hp);
      joinMessagesDuration(message, newMessage);
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
