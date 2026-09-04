import type { BaseActionParams } from '@/arena/Constuructors/BaseAction';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

class DivineIntervention extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'divineIntervention',
      displayName: '🌟 Божественное спасение',
      description: '1 раз за бой при получении смертельного урона божественная вспышка предотвращает гибель и исцеляет персонажа',
      chance: [100, 100, 100],
      effect: [25, 30, 35],
      bonusCost: [10, 20, 30],
      branch: 'holy',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onCast(game) {
        divineIntervention.onCast({ initiator, target: initiator, game });
      },
    });
  }

  onCast(params: BaseActionParams) {
    const { initiator, target, game } = params;
    this.createContext(initiator, target, game);

    if (!this.isActive()) {
      return;
    }

    if (initiator.stats.val('hp') > 0) {
      return;
    }

    const maxHp = initiator.stats.val('base.hp');
    const healPercent = this.getEffect() / 100;
    const restoredHp = Math.max(1, Math.round(maxHp * healPercent));

    initiator.stats.set('hp', restoredHp);
    this.status.effect = restoredHp;
    initiator.resetKiller();

    // Снимаем негативные эффекты
    initiator.affects.removeBadEffects();

    // Срабатывает ровно 1 раз за бой
    initiator.affects.removeEffectsByAction(this.name);

    this.next();
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} спасён божественным вмешательством ${brackets(`🌟+${args.effect}/${args.hp}`)}`;
  }
}

export const divineIntervention = new DivineIntervention();
