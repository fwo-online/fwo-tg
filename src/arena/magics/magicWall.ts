/* eslint-disable @typescript-eslint/no-use-before-define, max-classes-per-file */
import CastError from '@/arena/errors/CastError';
import { LongMagic } from '../Constuructors/LongMagicConstructor';
import { ProtectConstructor } from '../Constuructors/ProtectConstructor';
import type { OrderType } from '../Constuructors/types';

/**
 * Магическая стена
 * Основное описание магии общее требовани есть в конструкторе
 */

class MagicWall extends ProtectConstructor {
  name = 'magicWall';
  displayName = 'Магическая стена';
  orderType: OrderType = 'teamExceptSelf';

  getTargetProtectors({ target } = this.params) {
    return target.flags.isBehindWall;
  }
}

const magicWall = new MagicWall();

class MagicWallBuff extends LongMagic {
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

  run() {
    const { target, initiator } = this.params;
    target.stats.up('pdef', this.effectVal());
    target.flags.isBehindWall.push({ initiator: initiator.id, val: this.status.effect });
  }

  runLong() {
    const { target, initiator } = this.params;
    target.stats.up('pdef', this.effectVal());
    target.flags.isBehindWall.push({ initiator: initiator.id, val: this.status.effect });
  }

  preAffect({ initiator, target, game } = this.params, { effect } = { effect: 0 }) {
    if (initiator.flags.isBehindWall.length) {
      initiator.flags.isBehindWall.forEach((flag) => {
        const wallCaster = game.players.getById(flag.initiator);
        if (wallCaster) {
          // eslint-disable-next-line max-len
          throw new CastError(this.getSuccessResult({ initiator: wallCaster, target: initiator, game }));
        }
      });
    }

    if (target.flags.isBehindWall) {
      magicWall.preAffect({ initiator, target, game }, { effect });
      magicWall.reset();
    }
  }
}

export default new MagicWallBuff();
