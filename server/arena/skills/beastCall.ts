import { times } from 'es-toolkit/compat';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

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
      chance: [95, 98, 100],
      effect: [2, 3, 4],
      profList: {},
      bonusCost: [0, 0, 0],
    });
  }

  run() {
    const { initiator, game } = this.params;
    const initiatorMagicLvl = initiator.skills[this.name];
    const effect = this.effect[initiatorMagicLvl - 1] || 1;

    const allies = game.players.getMyTeam(initiator.id);
    const wolfs = times(effect).map((i) => createWolf(initiator.lvl, i + 1 + (allies.length - 1)));
    game.addPlayers(wolfs);

    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export default new BeastCall();
