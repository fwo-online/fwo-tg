import type { SuccessArgs } from '@/arena/Constuructors/types';
import * as icons from '@/utils/icons';

const expBrackets = (str: string) => `\n\\[ ${str} ]`;

export function formatExp(args: SuccessArgs): string {
  switch (args.actionType) {
    case 'dmg-magic':
    case 'dmg-magic-long': {
      const damageType = icons.damageType[args.dmgType];
      if (args.expArr) {
        return [
          args.expArr.map(({
            name, val, hp,
          }) => `\n${name} ${damageType}  💔-${val}/${hp}`).join(''),
          expBrackets(`📖${args.exp}`)].join('');
      }
      return expBrackets(`${damageType} 💔-${args.dmg}/${args.hp} 📖${args.exp}`);
    }
    case 'heal-magic': {
      return expBrackets(`❤️+${args.effect}/${args.hp} 📖${args.exp}`);
    }
    case 'heal':
      return expBrackets(args.expArr.map(({ name, exp, val }) => `${name}: 💖${val}/${args.hp} 📖${exp}`).join(', '));
    case 'phys':
      return expBrackets(`💔-${args.dmg}/${args.hp} 📖${args.exp}`);
    default:
      return expBrackets(`📖${args.exp}`);
  }
}
