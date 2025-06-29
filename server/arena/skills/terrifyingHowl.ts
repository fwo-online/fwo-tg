import { shuffle } from 'es-toolkit';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { joinWithAnd } from '@/arena/LogService/utils/join-with-and';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';

/**
 * 🐺🔊 Ужасающий вой
 */
class TerrifyingHowl extends Skill {
  constructor() {
    super({
      name: 'terrifyingHowl',
      displayName: '🐺🔊 Ужасающий вой',
      desc: 'Заставляет врагов оцепенеть',
      cost: [50, 75, 100],
      proc: 50,
      baseExp: 8,
      costType: 'en',
      orderType: 'enemy',
      aoeType: 'target',
      chance: [80, 90, 100],
      effect: [0, 1, 3],
      profList: {},
      bonusCost: [0, 0, 0],
    });
  }

  run() {
    const { initiator, target, game } = this.params;
    const initiatorMagicLvl = initiator.skills[this.name];
    const effect = this.effect[initiatorMagicLvl - 1] || 1;

    const enemies = shuffle(game.players.getAliveEnemies(initiator))
      .filter(({ id }) => id !== target.id)
      .splice(0, effect)
      .concat(target);

    enemies.forEach((target) => {
      target.flags.isParalysed.push({ initiator, val: effect });
      this.status.expArr.push({ initiator, target });
    });

    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} испустил ${italic(this.displayName)}! ${joinWithAnd(args.expArr.map(({ target }) => bold(target.nick)))} не в силах двигаться от страха!`;
  }
}

export default new TerrifyingHowl();
