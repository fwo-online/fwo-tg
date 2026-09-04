import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { Magic } from '@/arena/Constuructors/MagicConstructor';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

class PhaseShift extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'phaseShift',
      displayName: '🔮 Фазовый сдвиг',
      description:
        'Шанс полностью поглотить входящий магический урон, рассеивая заклинание в астрале',
      chance: [25, 32, 40],
      effect: [100, 100, 100],
      bonusCost: [10, 20, 30],
      branch: 'arcana',
    });
  }

  run() {
    const { initiator } = this.params;

    initiator.affects.addPassive({
      action: this.name,
      initiator,
      value: 0,
      onBeforeDamageRecieve(ctx, action) {
        phaseShift.onBeforeDamageRecieve(ctx, action);
      },
    });
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, action: BaseAction) {
    const isMagic = action instanceof Magic;

    if (!isMagic) {
      return;
    }

    const { initiator: attacker, target: defender, game } = ctx.params;
    this.createContext(defender, attacker, game);

    if (!this.isActive(this.context)) {
      return;
    }

    if (!this.checkChance(this.context)) {
      return;
    }

    // Полное поглощение магического урона
    const absorbed = ctx.status.effect;
    ctx.status.effect = 0;
    this.status.effect = absorbed;

    ctx.addAffect(this, this.context);
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} рассеял магию ${bold(args.target.nick)} ${brackets(`🔮 Поглощено: ${args.effect}`)}`;
  }
}

export const phaseShift = new PhaseShift();
