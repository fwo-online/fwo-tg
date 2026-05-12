import { attack } from '@/arena/actions';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { formatExp } from '@/arena/LogService/utils/format-exp';
import { italic } from '@/utils/formatString';

class SweepingBlow extends PassiveSkillConstructor {
  weaponTypes = ['cut'];
  private lock = false;

  constructor() {
    super({
      name: 'sweepingBlow',
      displayName: '💥 Размашистый удар',
      description: 'Атака по цели имеет шанс нанести урон другой цели',
      chance: [10, 25, 50],
      effect: [25, 50, 75],
      bonusCost: [],
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageDealt(ctx, action) {
        sweepingBlow.onDamageDealt(ctx, action);
      },
    });
  }

  private getRandomTarget(ctx: BaseActionContext) {
    const randomTargetAllies = ctx.game.players.getAliveAllies(ctx.target);

    if (randomTargetAllies.length) {
      return ctx.game.players.getRandom(randomTargetAllies);
    }

    const randomEnemies = ctx.game.players
      .getAliveEnemies(ctx.initiator)
      .filter((enemy) => enemy.id !== ctx.target.id);

    if (randomEnemies.length) {
      return ctx.game.players.getRandom(randomEnemies);
    }
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    // Предотвращаем циклический onDamageDealt
    if (this.lock) {
      return;
    }

    const { initiator, target, game } = ctx;
    this.createContext(initiator, target, game);

    if (action.actionType !== 'phys') {
      return;
    }

    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      return;
    }

    if (!this.isActive(ctx)) {
      return;
    }

    if (!this.checkChance(ctx)) {
      return;
    }

    const randomTarget = this.getRandomTarget(ctx);

    if (!randomTarget) {
      return;
    }

    this.createContext(initiator, randomTarget, game);

    const effect = this.getEffect();
    this.status.effect = ctx.status.effect * (effect / 100);

    try {
      this.lock = true;
      const val = effectService.rawDamage(this.context, action);
      // @todo убрать костыль с атакой после выноса exp в отдельный сервис
      this.status.exp = attack.getEffectExp(this.context, val);
      const result = ctx.addAffect(this, this.context);
      attack.giveExp(result);
    } finally {
      this.lock = false;
    }
  }

  customMessage(args: SuccessArgs) {
    console.log('TEST');
    return `${italic(args.action)} ${formatExp({
      ...args,
      actionType: 'phys',
    })}`;
  }
}

export const sweepingBlow = new SweepingBlow();
