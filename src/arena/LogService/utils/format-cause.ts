import type { SuccessArgs } from '@/arena/Constuructors/types';
import { formatAction } from './format-action';
import { formatExp } from './format-exp';

export function formatCause(cause: SuccessArgs) {
  switch (cause.actionType) {
    case 'dodge':
    case 'skill':
      return `_${cause.action}_ *${cause.initiator.nick}*: 📖${cause.exp}`;
    case 'protect':
      return `_${cause.action}_ ${cause.expArr.map(({ initiator, exp }) => `*${initiator.nick}*: 📖${exp}`)}`;
    case 'dmg-magic':
      return `$${formatAction(cause)}\n${formatExp(cause)}`;
    default:
      return `_${cause.action}_ *${cause.initiator.nick}*`;
  }
}
