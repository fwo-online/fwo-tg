import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🛡️ Спасение
 * Перенаправляет физические атаки по союзнику на Воина, снижая входящий урон
 */
class Help extends Skill {
  actionType: ActionType = 'skill';

  constructor() {
    super({
      name: 'help',
      displayName: '🛡️ Спасение',
      desc: 'Прикрывает выбранного соратника, принимая физические атаки по нему на себя со снижением урона',
      cost: [10, 12, 14],
      proc: 10,
      baseExp: 30,
      costType: 'en',
      orderType: OrderType.TeamExceptSelf,
      aoeType: 'target',
      chance: [80, 90, 100],
      effect: [15, 25, 35],
      profList: { w: 3, l: 6 },
      bonusCost: [10, 20, 30],
      branches: ['guardian', 'scout'],
    });
  }

  run() {
    const { initiator, target } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const reduction = this.effect[initiatorSkillLvl - 1] ?? 20;

    target.affects.addLongEffect({
      action: this.name,
      duration: 1,
      proc: initiator.proc,
      initiator,
      value: reduction,
      onBeforeDamageRecieve(receiveCtx, action, affect) {
        if (action.actionType !== 'phys') {
          return;
        }
        const red = affect.value ?? 20;
        const interceptedDmg = Math.max(1, Math.round(receiveCtx.status.effect * (1 - red / 100)));
        receiveCtx.status.effect = 0;
        initiator.stats.down('hp', interceptedDmg);
      },
    });

    this.status.effect = reduction;
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} прикрыл ${bold(args.target.nick)} умением ${italic(this.displayName)} ${brackets(`🛡️-${args.effect}% урона`)}`;
  }
}

export const help = new Help();
export default help;
