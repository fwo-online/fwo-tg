import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🏹 Залп стрел
 * Усиливает следующую атаку дальнего боя: лучник выпускает дополнительную стрелу по второй цели
 */
class DoubleShot extends Skill {
  lock = false;
  constructor() {
    super({
      name: 'doubleShot',
      displayName: '🏹 Залп стрел',
      desc: 'Усиливает следующую атаку дальнего боя: лучник выпускает дополнительную стрелу по второй цели',
      cost: [12, 14, 16],
      proc: 30,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [80, 85, 90],
      effect: [60, 75, 90],
      profList: { l: 2 },
      bonusCost: [10, 20, 30],
      branch: 'barrage',
      branches: ['barrage'],
      weaponTypes: ['range'],
    });
  }

  run() {
    const { initiator } = this.params;
    const arrowPercent = this.getEffect(initiator);

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: arrowPercent,
      onDamageDealt(ctx, action) {
        doubleShot.onDamageDealt(ctx, action, this.value);
      },
    });

    this.status.effect = arrowPercent;
    this.calculateExp();
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction, value: number) {
    if (this.lock || action.actionType !== 'phys' || !doubleShot.checkWeapon(ctx.initiator)) {
      return;
    }

    const aliveEnemies = ctx.game.players
      .getAliveEnemies(ctx.initiator)
      .filter((player) => player.id !== ctx.target.id);

    const randomTarget = ctx.game.players.getRandom(aliveEnemies);

    if (!randomTarget) {
      return;
    }

    const proc = ctx.initiator.proc;
    this.lock = true;

    try {
      ctx.initiator.proc = ctx.initiator.proc * (value / 100);

      const actionClone = action.cloneAction();
      actionClone.isAffect = true;
      actionClone.cast(ctx.initiator, randomTarget, ctx.game);
      actionClone.context.addAffect(this);

      ctx.initiator.affects.addEffect({
        action: this.name,
        initiator: ctx.initiator,
        onAfterCast() {
          ctx.game.recordOrderResult(actionClone.getSuccessResult());
        },
      });
    } finally {
      ctx.initiator.proc = proc;
      this.lock = false;
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const doubleShot = new DoubleShot();
export default doubleShot;
