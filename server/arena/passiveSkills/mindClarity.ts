import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { Magic } from '@/arena/Constuructors/MagicConstructor';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';

class MindClarity extends PassiveSkillConstructor {
  constructor() {
    super({
      name: 'mindClarity',
      displayName: '🧘 Ясность разума',
      description: 'Иммунитет к безумию и искажениям разума, а также шанс спасти заклинание от срыва',
      chance: [20, 35, 50],
      effect: [0, 0, 0],
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
      onBeforeAction(ctx, action) {
        mindClarity.onBeforeAction(ctx, action);
      },
      onCastFail(ctx, action, reason) {
        return mindClarity.onCastFail(ctx, action, reason);
      },
    });
  }

  onBeforeAction(ctx: BaseActionContext, _action: BaseAction) {
    const { initiator } = ctx.params;
    // Очищаем безумие и глюки
    initiator.affects.removeEffectsByAction('madness');
    initiator.affects.removeEffectsByAction('glitch');
  }

  onCastFail(
    ctx: BaseActionContext,
    action: BaseAction,
    reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ): SuccessArgs | SuccessArgs[] | undefined {
    if (!(action instanceof Magic)) {
      return;
    }

    if (reason !== 'CHANCE_FAIL') {
      return;
    }

    const { initiator, target, game } = ctx;
    this.createContext(initiator, target, game);

    if (this.checkChance(this.context)) {
      return ctx.addAffect(this, this.context);
    }
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} сохранил ясность разума ${brackets('🧘 Заклинание спасено от срыва!')}`;
  }
}

export const mindClarity = new MindClarity();
