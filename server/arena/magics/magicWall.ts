/* eslint-disable @typescript-eslint/no-use-before-define, max-classes-per-file */
import CastError from '@/arena/errors/CastError';
import type { Affect } from '../Constuructors/interfaces/Affect';
import { LongMagic } from '../Constuructors/LongMagicConstructor';
import { ProtectConstructor } from '../Constuructors/ProtectConstructor';
import { OrderType } from '@fwo/shared';

/**
 * Магическая стена
 * Основное описание магии общее требовани есть в конструкторе
 */

class MagicWall extends ProtectConstructor {
  name = 'magicWall';
  displayName = 'Магическая стена';
  orderType = OrderType.TeamExceptSelf;

  getTargetProtectors({ target } = this.params) {
    return target.flags.isBehindWall;
  }

  run(): void {
    // do nothing
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
    target.stats.up('phys.defence', this.effectVal());
    target.flags.isBehindWall.push({ initiator, val: this.status.effect });
  }

  runLong() {
    const { target, initiator } = this.params;
    target.stats.up('phys.defence', this.effectVal());
    target.flags.isBehindWall.push({ initiator, val: this.status.effect });
  }

  preAffect: Affect['preAffect'] = (context): undefined => {
    const { initiator, target, game } = context.params;

    if (initiator.flags.isBehindWall.length) {
      throw new CastError(
        initiator.flags.isBehindWall.map(({ initiator: wallCaster }) =>
          this.getSuccessResult({ initiator: wallCaster, target: initiator, game }),
        ),
      );
    }

    if (target.flags.isBehindWall.length) {
      magicWall.reset();
      magicWall.preAffect?.(context);
    }
  };
}

export default new MagicWallBuff();
