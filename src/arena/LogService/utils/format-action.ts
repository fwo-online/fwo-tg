import { isUndefined } from 'lodash';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { weaponTypes } from '@/arena/MiscService';

export function formatAction(msgObj: SuccessArgs): string {
  if (msgObj.msg) {
    return msgObj.msg(msgObj);
  }

  switch (msgObj.actionType) {
    case 'heal':
      return `Игрок *${msgObj.target}* был вылечен 🤲 на *💖${msgObj.effect}*`;
    case 'phys': {
      const { action } = weaponTypes[msgObj.weapon.wtype];
      return `*${msgObj.initiator}* ${action(msgObj.target, msgObj.weapon)} и нанёс *${msgObj.dmg}* урона`;
    }
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic':
      return `*${msgObj.initiator}* сотворил _${msgObj.action}_ на *${msgObj.target}* нанеся ${msgObj.dmg} урона`;
    case 'magic':
      return isUndefined(msgObj.effect)
        ? `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}*`
        : `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}* с эффектом ${msgObj.effect}`;
    default:
      return `*${msgObj.initiator}* использовал _${msgObj.action}_ на *${msgObj.target}*`;
  }
}
