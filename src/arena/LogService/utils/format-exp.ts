import type { SuccessArgs } from '@/arena/Constuructors/types';
import * as icons from '@/utils/icons';

const expBrackets = (str: string) => `\n\\[ ${str} ]`;

export function formatExp(args: SuccessArgs): string {
  switch (args.actionType) {
    case 'dmg-magic':
    case 'dmg-magic-long': {
      const damageType = icons.damageType[args.dmgType];
      return expBrackets(`${damageType} 💔-${args.dmg}/${args.hp} 📖${args.exp}`);
    }
    case 'aoe-dmg-magic': {
      const damageType = icons.damageType[args.dmgType];
      return expBrackets([
        `${args.target} ${damageType} 💔-${args.dmg}/${args.hp} 📖${args.exp}`,
        ...args.expArr.map(({
          name, val, hp, exp,
        }) => `${name} ${damageType}  💔-${val}/${hp} 📖${exp}`),
      ].join('\n'));
    }
    case 'heal-magic': {
      return expBrackets(`❤️+${args.effect}/${args.hp} 📖${args.exp}`);
    }
    case 'heal':
      return expBrackets(args.expArr.map(({ name, exp, val }) => `${name}: 💖${val}/${args.hp} 📖${exp}`).join(', '));
    case 'protect':
      return expBrackets(args.expArr.map(({ name, exp }) => `${name}: 📖${exp}`).join(', '));
    case 'phys':
      return expBrackets(`💔-${args.dmg}/${args.hp} 📖${args.exp}`);
    case 'skill':
      return args.exp ? expBrackets(`📖${args.exp}`) : '';
    default:
      return expBrackets(`📖${args.exp}`);
  }
}
