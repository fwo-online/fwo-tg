import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { Skill } from '@/arena/Constuructors/SkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { concussion } from '@/arena/effects/concussion';
import { bold, italic } from '@/utils/formatString';

class ShakeUp extends Skill {
  constructor() {
    super({
      name: 'shakeUp',
      displayName: 'Встряска',
      desc: 'Следующее физическое попадание с уроном, включая сплеш, накладывает Контузию на 2 раунда. Подготовка действует до конца текущего раунда.',
      cost: [10, 10, 10],
      costType: 'en',
      proc: 25,
      baseExp: 0,
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [5, 10, 15, 20, 25, 30],
      profList: { w: 1 },
      bonusCost: [10, 20, 30, 40, 60, 80],
      branch: 'berserker',
    });
  }

  run() {
    const { initiator } = this.params;
    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value: this.getEffect(initiator),
      onDamageDealt(ctx, action, affect) {
        shakeUp.onDamageDealt(ctx, action, affect);
      },
    });
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys' || !(ctx.status.effect > 0)) {
      return;
    }

    const { initiator, target, game } = ctx;
    initiator.affects.removeEffectsByAction(this.name);
    target.affects.addLongEffect({
      action: concussion.name,
      initiator,
      value: affect.value,
      duration: 2,
      onCast(game, concussionAffect) {
        concussion.castLongEffect(initiator, target, game, concussionAffect);
      },
    });

    const concussionAffect = target.affects.getEffectsByAction(concussion.name).at(-1);
    concussionAffect?.onCast?.(game, concussionAffect);
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const shakeUp = new ShakeUp();
