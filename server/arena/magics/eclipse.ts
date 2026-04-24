import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import CastError from '../errors/CastError';

/**
 * Затмение
 * Основное описание магии общее требовани есть в конструкторе
 */
const params = Object.freeze({
  name: 'eclipse',
  displayName: 'Затмение',
  desc: 'Погружает арену во тьму, не позволяя атаковать',
  cost: 16,
  baseExp: 80,
  costType: 'mp',
  lvl: 3,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: ['1d80+20', '1d40+60', '1d20+80'],
  profList: ['p'],
  effect: [],
});

class Eclipse extends CommonMagic {
  run() {
    const { initiator, game } = this.params;
    game.flags.global.isEclipsed.push({ initiator });

    game.players.alivePlayers.forEach((player) => {
      player.affects.addEffect({
        action: this.name,
        initiator,
        proc: initiator.proc,
        onBeforeAction(ctx, action) {
          eclipse.onBeforeAction(ctx, action);
        },
      });
    });
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { game } = ctx.params;

    // @todo подумать как убрать глобальный флаг и нужно ли его убирать вообще
    throw new CastError(
      game.flags.global.isEclipsed.map(({ initiator }) =>
        this.getSuccessResult({ initiator, target: ctx.initiator, game }),
      ),
    );
  }
}

export const eclipse = new Eclipse(params);
