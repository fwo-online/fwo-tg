import { entries } from '@fwo/shared';
import { isEmptyObject } from 'es-toolkit';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { brackets, italic } from '@/utils/formatString';
import { getDamageTypeIcon } from '@/utils/icons';

export function formatExp(args: SuccessArgs): string {
  const exp = args.initiator.isBot ? '' : `📖${args.exp}`;
  switch (args.actionType) {
    case 'phys':
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic': {
      let dmgPart = '💔 ';
      if (args.effectParts) {
        if (!isEmptyObject(args.effectParts)) {
          dmgPart += entries(args.effectParts)
            .map(([effectType, val]) => `${getDamageTypeIcon(effectType)}-${val}`)
            .join(' ');
        } else {
          dmgPart = `${getDamageTypeIcon(args.effectType)} 💔-${args.effect}`;
        }
      }

      return brackets(
        [
          `${args.target.nick} ${dmgPart}/${args.hp} ${exp}`.trimEnd(),
          ...args.expArr.map(({ target, val, hp, exp, reason }) =>
            `${reason ? italic(reason) : ''} ${target.nick} ${getDamageTypeIcon(args.effectType)} 💔-${val}/${hp} 📖${exp}`.trimStart(),
          ),
        ].join('\n'),
      );
    }
    case 'heal-magic': {
      return brackets(`❤️+${args.effect}/${args.hp} ${exp}`);
    }
    case 'heal':
      return brackets(
        args.expArr
          .map(({ initiator, exp, val }) => `${initiator.nick}: 💖${val}/${args.hp} 📖${exp}`)
          .join(', '),
      );
    case 'protect':
      return brackets(
        args.expArr.map(({ initiator, exp }) => `${initiator.nick}: 📖${exp}`).join(', '),
      );
    case 'skill':
    case 'dodge':
      return args.exp ? brackets(exp) : '';
    case 'passive':
      return '';
    default:
      return brackets(exp);
  }
}
