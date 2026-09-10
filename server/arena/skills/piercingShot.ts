import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🎯 Бронебойный выстрел
 * Усиливает следующую атаку дальнего боя: стрела пробивает броню цели, игнорируя часть её защиты
 */
class PiercingShot extends Skill {
  constructor() {
    super({
      name: 'piercingShot',
      displayName: '🎯 Бронебойный выстрел',
      desc: 'Усиливает следующую атаку дальнего боя: стрела пробивает блок щитом и игнорирует 40–80% брони цели',
      cost: [12, 14, 16],
      proc: 20,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [50, 75, 95],
      effect: [30, 45, 60],
      profList: { l: 3 },
      bonusCost: [10, 20, 30],
      branch: 'marksman',
      branches: ['marksman'],
      weaponTypes: ['range'],
    });
  }

  run() {
    const { initiator } = this.params;
    const penPercent = this.getEffect(initiator);

    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: penPercent,
      onBeforeDamageDeal(ctx, action) {
        piercingShot.onBeforeDamageDeal(ctx, action, this.value);
      },
    });

    this.status.effect = penPercent;
    this.calculateExp();
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction, value: number) {
    if (action.actionType !== 'phys' || !this.checkWeapon(ctx.initiator)) {
      return;
    }

    // Пробивает блок щитом
    ctx.target.affects.removeEffectsByAction('shieldBlock');

    const penRatio = value / 100;
    const targetDef = ctx.target.stats.val('phys.defence');

    const defReduction = floatNumber(targetDef * penRatio);
    ctx.target.stats.down('phys.defence', defReduction);

    ctx.addAffect(this, ctx);

    ctx.initiator.affects.removeEffectsByAction(this.name);
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const piercingShot = new PiercingShot();
export default piercingShot;
