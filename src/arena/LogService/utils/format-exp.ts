import type { SuccessArgs } from '@/arena/Constuructors/types';
import { getDamageTypeIcon } from '@/utils/icons';

const expBrackets = (str: string) => `\\[ ${str} ]`;

export function formatExp(args: SuccessArgs): string {
  switch (args.actionType) {
    case 'phys':
    case 'dmg-magic':
    case 'dmg-magic-long':
    case 'aoe-dmg-magic': {
      return expBrackets([
        `${args.target.nick} ${getDamageTypeIcon(args.effectType)} 💔-${args.effect}/${args.hp} 📖${args.exp}`,
        ...args.expArr.map(({
          target, val, hp, exp,
        }) => `${target.nick} ${getDamageTypeIcon(args.effectType)} 💔-${val}/${hp} 📖${exp}`),
      ].join('\n'));
    }
    case 'heal-magic': {
      return expBrackets(`❤️+${args.effect}/${args.hp} 📖${args.exp}`);
    }
    case 'heal':
      return expBrackets(args.expArr.map(({ initiator, exp, val }) => `${initiator.nick}: 💖${val}/${args.hp} 📖${exp}`).join(', '));
    case 'protect':
      return expBrackets(args.expArr.map(({ initiator, exp }) => `${initiator.nick}: 📖${exp}`).join(', '));
    case 'skill':
    case 'dodge':
      return args.exp ? expBrackets(`📖${args.exp}`) : '';
    case 'passive':
      return '';
    default:
      return expBrackets(`📖${args.exp}`);
  }
}
