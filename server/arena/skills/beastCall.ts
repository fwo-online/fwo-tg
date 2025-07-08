import { times } from 'es-toolkit/compat';
import arena from '@/arena';
import MiscService from '@/arena/MiscService';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🐺📣 Звериный клич
 */
class BeastCall extends Skill {
  constructor() {
    super({
      name: 'beastCall',
      displayName: '🐺📣 Звериный клич',
      desc: 'Призывает волков на помощь',
      cost: [0, 0, 0],
      proc: 75,
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
    const wolfs = times(effect).map((i) =>
      createWolf(
        initiator.lvl - 3 + MiscService.randInt(-1, 2),
        i + 1 + Math.max(allies.length - 1, 0),
      ),
    );
    wolfs.forEach((wolf) => {
      wolf.clan = initiator.clan;
      initiator.clan?.players.push(arena.characters[wolf.id].charObj);
    });
    game.addPlayers(wolfs);

    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export default new BeastCall();
