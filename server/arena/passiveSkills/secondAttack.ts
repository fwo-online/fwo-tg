import { attack } from '@/arena/actions';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';

/**
 * 🏹 Вторая атака
 * При выстреле из лука лучник с шансом производит мгновенный второй выстрел
 */
class SecondAttack extends PassiveSkillConstructor {
  weaponTypes = ['range'];
  private lock = false;

  constructor() {
    super({
      name: 'secondAttack',
      displayName: '🏹 Вторая атака',
      description: 'При стрельбе из оружия дальнего боя есть шанс выпустить мгновенную вторую стрелу',
      chance: [20, 30, 40],
      effect: [40, 60, 80],
      bonusCost: [10, 20, 30],
      branch: 'barrage',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        secondAttack.onDamageDealt(ctx, action);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    if (this.lock) {
      return;
    }

    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx;
    this.createContext(initiator, target, game);

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.isActive(ctx)) {
      return;
    }

    if (!this.checkChance(ctx)) {
      return;
    }

    if (target.stats.val('hp') <= 0) {
      return;
    }

    const secondPercent = this.getEffect(ctx);
    const secondDamage = floatNumber(ctx.status.effect * (secondPercent / 100));

    if (secondDamage <= 0) {
      return;
    }

    const secondCtx = ctx.cloneWith(target);
    secondCtx.status.effect = secondDamage;

    try {
      this.lock = true;
      const val = effectService.rawDamage(secondCtx, action);
      this.status.effect = secondDamage;
      this.status.exp = attack.getEffectExp(secondCtx, val);
      const result = ctx.addAffect(this, this.context);
      attack.giveExp(result);
    } finally {
      this.lock = false;
    }
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} выпустил вторую стрелу по ${bold(args.target.nick)} нанеся *${args.effect}* урона`;
  }
}

export const secondAttack = new SecondAttack();
