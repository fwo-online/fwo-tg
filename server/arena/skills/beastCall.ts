import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import { times } from 'es-toolkit/compat';

/**
 * Берсерк
 */
class BeastCall extends Skill {
  constructor() {
    super({
      name: 'beastCall',
      displayName: '🐺📣 Звериный клич',
      desc: 'Призывает волков на помощь',
      cost: [0, 0, 0],
      proc: 50,
      baseExp: 8,
      costType: 'en',
      orderType: 'self',
      aoeType: 'target',
      chance: [90, 95, 100],
      effect: [1, 2, 3],
      profList: {},
      bonusCost: [0, 0, 0],
    });
  }

  run() {
    const { initiator, game } = this.params;
    const initiatorMagicLvl = initiator.skills[this.name];
    const effect = this.effect[initiatorMagicLvl - 1] || 1;

    times(effect).forEach((i) => {
      game.players.add(createWolf(initiator.lvl - 5, (i + 1).toString()));
    });

    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export default new BeastCall();
