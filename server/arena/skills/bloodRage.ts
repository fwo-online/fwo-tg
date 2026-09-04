import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { bold, brackets, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🪓 Кровавая ярость
 * Воин жертвует частью здоровья ради значительного прироста физического урона на 2 раунда
 */
class BloodRage extends Skill {
  actionType: ActionType = 'skill';

  constructor() {
    super({
      name: 'bloodRage',
      displayName: '🪓 Кровавая ярость',
      desc: 'Воин жертвует 10% своего здоровья, увеличивая весь наносимый физический урон на 2 раунда',
      cost: [8, 10, 12],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [80, 90, 100],
      effect: [20, 30, 40],
      profList: { w: 3 },
      bonusCost: [10, 20, 30],
      branch: 'berserker',
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const bonus = this.effect[initiatorSkillLvl - 1] ?? 20;

    const selfDamage = Math.max(1, Math.round(initiator.stats.val('hp') * 0.1));
    initiator.stats.down('hp', selfDamage);

    initiator.affects.addLongEffect({
      action: this.name,
      duration: 2,
      proc: initiator.proc,
      initiator,
      value: bonus,
      onBeforeDamageDeal(dealCtx, action, affect) {
        if (action.actionType === 'phys') {
          const b = affect.value ?? 20;
          dealCtx.status.effect = Math.round(dealCtx.status.effect * (1 + b / 100));
        }
      },
    });

    this.status.effect = bonus;
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} впал в ${italic(this.displayName)} ${brackets(`🪓+${args.effect}% урона на 2 раунда`)}`;
  }
}

export const bloodRage = new BloodRage();
export default bloodRage;
