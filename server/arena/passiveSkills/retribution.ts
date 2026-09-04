import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { bold, brackets, italic } from '@/utils/formatString';

class Retribution extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'retribution',
      displayName: '⚖️ Возмездие',
      description:
        'Любой противник, наносящий урон персонажу, получает процент святого урона в ответ',
      chance: [100, 100, 100],
      effect: [0.12, 0.2, 0.3],
      bonusCost: [10, 20, 30],
      branch: 'inquisition',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onDamageReceived(ctx, action) {
        retribution.onDamageReceived(ctx, action);
      },
    });
  }

  onDamageReceived(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType === 'passive') {
      return; // Предотвращаем бесконечный цикл возмездия
    }

    const { initiator: attacker, target: defender, game } = ctx.params;

    // Атакующий не должен быть тем же персонажем
    if (attacker.id === defender.id) {
      return;
    }

    this.createContext(defender, attacker, game);

    if (!this.isActive(this.context)) {
      return;
    }

    const returnDamage = Math.max(1, Math.round(ctx.status.effect * this.getEffect(this.context)));
    this.status.effect = returnDamage;

    effectService.rawDamage(this.context, this);

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} покарал ${bold(args.target.nick)} ${brackets(`⚖️-${args.effect} HP`)}`;
  }
}

export const retribution = new Retribution();
