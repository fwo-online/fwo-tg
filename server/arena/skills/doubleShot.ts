import { EffectType, OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { effectService } from '@/arena/EffectService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🏹 Залп стрел
 * Усиливает следующую атаку дальнего боя: лучник выпускает дополнительную стрелу по второй цели (или той же цели)
 */
class DoubleShot extends Skill {
  constructor() {
    super({
      name: 'doubleShot',
      displayName: '🏹 Залп стрел',
      desc: 'Усиливает следующую атаку дальнего боя: лучник выпускает дополнительную стрелу по второй цели (или той же цели)',
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
      onDamageDealt(ctx, action, affect) {
        if (action.actionType === 'phys' && doubleShot.checkWeapon(ctx.initiator)) {
          doubleShot.onDamageDealt(ctx, action, affect);
        }
      },
    });

    this.status.effect = arrowPercent;
    this.calculateExp();
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    const { initiator, target, game } = ctx;
    const aliveEnemies = game.players.getAliveEnemies(initiator);
    const target2 = aliveEnemies.find((e) => e.id !== target.id) ?? target;

    if (target2.stats.val('hp') > 0) {
      const arrowPercent = (affect.value ?? 75) / 100;
      const secondHitDmg = floatNumber(ctx.status.effect * arrowPercent);
      const ctx2 = ctx.cloneWith(target2);
      ctx2.status.setEffectPart(EffectType.Physical, secondHitDmg);
      effectService.damage(ctx2, this);
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const doubleShot = new DoubleShot();
export default doubleShot;
