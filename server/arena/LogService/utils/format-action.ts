import type { SuccessArgs } from '@/arena/Constuructors/types';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';

export function formatAction(msgObj: SuccessArgs): string {
  if (msgObj.msg) {
    return msgObj.msg(msgObj);
  }

  const calculateEffect = () => {
    if (msgObj.expArr.length) {
      return msgObj.expArr.reduce((effect, { val }) => {
        return floatNumber(effect + (val || 0));
      }, msgObj.effect);
    }

    return msgObj.effect;
  };

  switch (msgObj.actionType) {
    case 'heal':
      return `Игрок ${bold`${msgObj.target.nick}`} был вылечен 🤲 на ${bold`💖${msgObj.effect}`}`;
    case 'phys': {
      return `${bold(msgObj.initiator.nick)} ${MiscService.getWeaponAction(msgObj.target, msgObj.weapon)} и нанёс ${bold(msgObj.effect.toString())} урона`;
    }
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic':
      return `${bold(msgObj.initiator.nick)} сотворил ${italic(msgObj.action)} на ${bold(msgObj.target.nick)} нанеся ${calculateEffect()} урона`;
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
