import type { SuccessArgs } from '@/arena/Constuructors/types';
import { calculateEffect } from '@/arena/HistoryService/utils/calculateEffect';
import MiscService from '@/arena/MiscService';
import { bold, italic } from '@/utils/formatString';

export function formatAction(msgObj: SuccessArgs): string {
  if (msgObj.msg) {
    return msgObj.msg(msgObj);
  }

  switch (msgObj.actionType) {
    case 'heal':
      return `Игрок ${bold`${msgObj.target.nick}`} был вылечен 🤲 на ${bold`💖${msgObj.effect}`}`;
    case 'phys': {
      return `${bold(msgObj.initiator.nick)} ${MiscService.getWeaponAction(msgObj.target, msgObj.weapon)} и нанёс ${bold(msgObj.effect.toString())} урона`;
    }
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic':
      return `${bold(msgObj.initiator.nick)} сотворил ${italic(msgObj.action)} на ${bold(msgObj.target.nick)} нанеся ${calculateEffect(msgObj)} урона`;
    case 'magic':
    case 'magic-long':
      return !msgObj.effect
        ? `${bold(msgObj.initiator.nick)} использовал ${italic(msgObj.action)} на ${bold(msgObj.target.nick)}`
        : `${bold(msgObj.initiator.nick)} использовал ${italic(msgObj.action)} на ${bold(msgObj.target.nick)} с эффектом ${msgObj.effect}`;
    case 'skill':
    case 'dodge':
      return msgObj.orderType === 'self'
        ? `${bold(msgObj.initiator.nick)} использовал ${italic(msgObj.action)}`
        : `${bold(msgObj.initiator.nick)} использовал ${italic(msgObj.action)} на ${bold(msgObj.target.nick)}`;
    case 'passive':
      return `${italic(msgObj.action)}`;
    default:
      return `${bold(msgObj.initiator.nick)} использовал ${italic(msgObj.action)} на ${bold(msgObj.target.nick)}`;
  }
}
