import { bold, italic } from '@/utils/formatString';
import type { Affect } from '../Constuructors/interfaces/Affect';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';
import CastError from '../errors/CastError';

const parryableWeaponTypes = [
  's', // колющее
  'cut', // режущее
  'chop', // рубящее
];

/**
 * Парирование
 */
class Parry extends Skill implements Affect {
  constructor() {
    super({
      name: 'parry',
      displayName: '🤺 Парирование',
      desc: 'Шанс спарировать одну атаку. На 6 уровне обучения парирование будет отбивать несколько атак.',
      cost: [8, 9, 10, 11, 12, 13],
      proc: 10,
      baseExp: 8,
      costType: 'en',
      orderType: 'self',
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      profList: { w: 1 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.getSkillLevel(this.name);
    const effect = this.effect[initiatorSkillLvl - 1] || 1;
    // изменяем
    initiator.flags.isParry = initiator.stats.val('attributes.dex') * effect;
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator, target, game } }): undefined => {
    const isParryable = initiator.weapon.isOfType(parryableWeaponTypes);

    if (target.flags.isParry && isParryable) {
      const initiatorDex = initiator.stats.val('attributes.dex');

      if ((target.flags.isParry - initiatorDex) > 0) {
        this.calculateExp();

        throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
      }

      target.flags.isParry -= initiatorDex;
    }
  };

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export default new Parry();
