import type { SuccessArgs } from '@/arena/Constuructors/types';
import { getDamageTypeIcon } from '@/utils/icons';

export function formatCause(cause: SuccessArgs) {
  switch (cause.actionType) {
    case 'skill':
      return `_${cause.action}_ *${cause.initiator}*: 📖${cause.exp}`;
    case 'protect':
      return `_${cause.action}_ ${cause.expArr.map(({ name, exp }) => `*${name}*: 📖${exp}`)}`;
    case 'dmg-magic':
      return `_${cause.action}_ *${cause.initiator}* >> *${cause.target}* ${`${getDamageTypeIcon(cause.effectType)} 💔-${cause.effect}/${cause.hp}`}`;
    default:
      return `_${cause.action}_ *${cause.initiator}*`;
  }
}
