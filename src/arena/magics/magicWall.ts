import type { PreAffect } from '@/arena/Constuructors/interfaces/PreAffect';
import CastError from '@/arena/errors/CastError';
import { LongMagic } from '../Constuructors/LongMagicConstructor';

/**
 * Магическая стена
 * Основное описание магии общее требовани есть в конструкторе
 */
class MagicWall extends LongMagic implements PreAffect {
  constructor() {
    super({
      name: 'magicWall',
      displayName: 'Магическая стена',
      desc: 'Защищает цель, цель не может атаковать, нельзя использовать на себя',
      cost: 30,
      baseExp: 0.1,
      costType: 'mp',
      lvl: 4,
      orderType: 'teamExceptSelf',
      aoeType: 'target',
      magType: 'good',
      chance: [100, 100, 100],
      profList: ['p'],
      effect: ['1d25+125', '1d50+150', '1d100+200'],
    });
  }

  calculateExp(effect: number, baseExp = 0) {
    return Math.round(effect * baseExp * this.params.initiator.proc);
  }

  run() {
    const { target, initiator } = this.params;
    target.stats.up('pdef', this.effectVal());
    target.flags.isBehindWall = { initiator: initiator.id, val: this.status.effect };
  }

  runLong() {
    const { target, initiator } = this.params;
    target.stats.up('pdef', this.effectVal());
    target.flags.isBehindWall = { initiator: initiator.id, val: this.status.effect };
  }

  preAffect({ initiator, game } = this.params) {
    if (initiator.flags.isBehindWall) {
      const wallCaster = game.players.getById(initiator.flags.isBehindWall.initiator);
      if (wallCaster) {
        // eslint-disable-next-line max-len
        throw new CastError(this.getSuccessResult({ initiator: wallCaster, target: initiator, game }));
      }
    }
  }
}

export default new MagicWall();
