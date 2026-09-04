import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, italic } from '@/utils/formatString';
import { formatAction } from './format-action';
import { formatExp } from './format-exp';

export function formatCause(cause: SuccessArgs) {
  switch (cause.actionType) {
    case 'dodge':
    case 'skill':
      return `${italic(cause.action)} ${bold(cause.initiator.nick)}: 📖${cause.exp}`;
    case 'protect':
      return `${italic(cause.action)} ${cause.expArr.map(({ initiator, exp }) => `${bold(initiator.nick)}: 📖${exp}`)}`;
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'heal':
      return `${formatAction(cause)}\n${formatExp(cause)}`;
    case 'passive':
      return cause.msg?.(cause) ?? `${italic(cause.action)} ${bold(cause.initiator.nick)}`;
    default:
      return `${italic(cause.action)} ${bold(cause.initiator.nick)}`;
  }
}
