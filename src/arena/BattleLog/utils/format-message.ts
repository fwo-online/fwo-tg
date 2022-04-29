import type { LogMessage } from '../types';
import { formatAction } from './format-action';
import { formatError } from './format-error';
import { formatExp } from './format-exp';

export function formatMessage(msgObj: LogMessage) {
  if (msgObj.__success) {
    return `${formatAction(msgObj)} ${formatExp(msgObj)}`;
  }
  return formatError(msgObj);
}
