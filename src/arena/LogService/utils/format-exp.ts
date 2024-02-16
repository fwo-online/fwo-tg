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
        `${args.target} ${getDamageTypeIcon(args.effectType)} 💔-${args.effect}/${args.hp} 📖${args.exp}`,
        ...args.expArr.map(({
          name, val, hp, exp,
        }) => `${name} ${getDamageTypeIcon(args.effectType)} 💔-${val}/${hp} 📖${exp}`),
      ].join('\n'));
    }
    case 'heal-magic': {
      return expBrackets(`❤️+${args.effect}/${args.hp} 📖${args.exp}`);
    }
    case 'heal':
      return expBrackets(args.expArr.map(({ name, exp, val }) => `${name}: 💖${val}/${args.hp} 📖${exp}`).join(', '));
    case 'protect':
      return expBrackets(args.expArr.map(({ name, exp }) => `${name}: 📖${exp}`).join(', '));
    case 'skill':
      return args.exp ? expBrackets(`📖${args.exp}`) : '';
    default:
      return expBrackets(`📖${args.exp}`);
  }
}
