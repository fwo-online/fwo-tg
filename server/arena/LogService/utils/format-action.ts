import type { SuccessArgs } from '@/arena/Constuructors/types';
import { calculateEffect } from '@/arena/HistoryService/utils/calculateEffect';
import MiscService from '@/arena/MiscService';
import { bold, italic } from '@/utils/formatString';

export function formatAction(msgObj: SuccessArgs): string {
  if (msgObj.msg) {
    return msgObj.msg(msgObj);
  }

  const initiator = msgObj.initiator.isBot
    ? `🐺${bold(msgObj.initiator.nick)}`
    : bold(msgObj.initiator.nick);
  const target = msgObj.target.isBot
    ? `🐺${bold(msgObj.target.nick)}`
    : bold(msgObj.initiator.nick);

  switch (msgObj.actionType) {
    case 'heal':
      return `Игрок ${bold`${msgObj.target.nick}`} был вылечен 🤲 на ${bold`💖${msgObj.effect}`}`;
    case 'phys': {
      return `${initiator} ${MiscService.getWeaponAction(msgObj.target, msgObj.weapon)} и нанёс ${bold(msgObj.effect.toString())} урона`;
    }
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic':
      return `${initiator} сотворил ${italic(msgObj.action)} на ${target} нанеся ${calculateEffect(msgObj)} урона`;
    case 'magic':
    case 'magic-long':
      return !msgObj.effect
        ? `${initiator} использовал ${italic(msgObj.action)} на ${target}`
        : `${initiator} использовал ${italic(msgObj.action)} на ${target} с эффектом ${msgObj.effect}`;
    case 'skill':
    case 'dodge':
      return msgObj.orderType === 'self'
        ? `${initiator} использовал ${italic(msgObj.action)}`
        : `${initiator} использовал ${italic(msgObj.action)} на ${target}`;
    case 'passive':
      return `${italic(msgObj.action)}`;
    default:
      return `${initiator} использовал ${italic(msgObj.action)} на ${target}`;
  }
}
