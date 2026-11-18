import { OrderType } from '@fwo/shared';
import type { BaseAction } from '@/arena/Constuructors/BaseAction';
import type { BaseActionContext } from '@/arena/Constuructors/BaseActionContext';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import type { ActionType } from '@/arena/Constuructors/types';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🛡️ Спасение
 * Принимает ограниченное число физических атак по союзнику до конца раунда.
 */
class Help extends Skill {
  actionType: ActionType = 'skill';

  constructor() {
    super({
      name: 'help',
      displayName: '🛡️ Спасение',
      desc: `До конца раунда принимает на себя физические атаки по выбранному соратнику`,
      cost: [10, 11, 12, 13, 14, 15],
      proc: 15,
      baseExp: 20,
      costType: 'en',
      orderType: OrderType.TeamExceptSelf,
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1, 1, 1, 1, 1, 1],
      profList: { w: 3, l: 6 },
      bonusCost: [10, 20, 30, 40, 60, 80],
      branch: 'scout',
      branches: ['guardian', 'scout'],
    });
  }

  run() {
    const { initiator, target } = this.params;

    target.affects.removeEffectsByAction(this.name);
    console.log(target.affects.getEffectsByAction(this.name).length);
    target.affects.addEffect({
      action: this.name,
      proc: initiator.proc,
      initiator,
      onBeforeDamageRecieve(ctx, action, affect) {
        help.onBeforeDamageRecieve(ctx, action, affect);
      },
    });

    this.calculateExp();
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys' || !affect.value) {
      return;
    }

    const rescuer = affect.initiator;
    const protectedTarget = ctx.target;

    ctx.overrideTarget(rescuer);

    const record = ctx.addAffect(this, this.createContext(rescuer, protectedTarget, ctx.game));

    // @todo сделать нормально вывод сообщений
    record.msg = this.customCauseMessage.bind(this);
    record.actionType = 'passive';
  }

  customCauseMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} перехватил атаку по ${bold(args.target.nick)} умением ${italic(this.displayName)}`;
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} прикрыл ${bold(args.target.nick)} умением ${italic(this.displayName)}`;
  }
}

export const help = new Help();
export default help;
