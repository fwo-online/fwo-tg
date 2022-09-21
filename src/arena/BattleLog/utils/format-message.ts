import type { Message } from '../BattleLog';
import { formatAction } from './format-action';
import { formatError } from './format-error';
import { formatExp } from './format-exp';

export function formatMessage(msgObj: Message) {
  if ('message' in msgObj) {
    return formatError(msgObj);
  }
  return `${formatAction(msgObj)}${formatExp(msgObj)}`;
}
