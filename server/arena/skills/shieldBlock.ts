import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { bold, italic } from '../../utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';
import CastError from '@/arena/errors/CastError';
import { floatNumber } from '@/utils/floatNumber';

const shieldTypes = ['shield'];

/**
 * Парирование
 * {me      {((0.3*str) + (0.7*con)) * level}}
 * {enemy   {(0.7*str) + (0.3*con)}}
 * {fall    {2*me - enemy}}
 *
 */
class ShieldBlock extends Skill {
  constructor() {
    super({
      name: 'shieldBlock',
      displayName: 'Блок щитом',
      desc: 'Позволяет блокировать атаки до тех пор, пока щит не будет пробит. Повышает магическую защиту пока умение активно (требуется наличие щита)',
      cost: [8, 9, 10, 11, 12, 13],
      proc: 10,
      baseExp: 8,
      costType: 'en',
      orderType: 'self',
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      profList: { w: 2 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name];
    const shield = initiator.offHand.item;
    if (!shield || !initiator.offHand.isOfType(shieldTypes)) {
      throw new CastError('NO_SHIELD');
    }

    const effect = this.effect[initiatorSkillLvl - 1] || 1;
    const str = initiator.stats.val('attributes.str');
    const con = initiator.stats.val('attributes.con');
    const value = (0.3 * str + 0.7 * con + 0.25 * shield.phys.defence) * effect;

    this.status.effect = floatNumber(value);
    initiator.flags.isShielded = this.status.effect;
    initiator.stats.up('magic.defence', this.status.effect);
  }

  preAffect: Affect['postAffect'] = ({ params: { initiator, target, game } }): undefined => {
    if (target.flags.isShielded) {
      const str = initiator.stats.val('attributes.str');
      const con = initiator.stats.val('attributes.con');
      const value = (0.7 * str + 0.3 * con) * initiator.proc;

      if (value < target.flags.isShielded) {
        target.stats.down('magic.defence', value);
        target.flags.isShielded -= value;

        this.calculateExp();

        throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
      }

      target.stats.down('magic.defence', target.flags.isShielded);
      target.flags.isShielded = 0;
    }
  };

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} с эффектом ${args.effect}`;
  }
}

export default new ShieldBlock();
