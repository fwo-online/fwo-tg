import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🏃 Полевая перевязка
 * Быстрое полевое лечение союзника или себя за счёт ловкости и запаса энергии
 */
class FieldMedic extends Skill {
  actionType: ActionType = 'heal';

  constructor() {
    super({
      name: 'fieldMedic',
      displayName: '🏃 Полевая перевязка',
      desc: 'Быстрая перевязка ран на поле боя: восстанавливает здоровье выбранному соратнику или себе',
      cost: [10, 12, 14],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Team,
      aoeType: 'target',
      chance: [80, 90, 100],
      effect: [20, 30, 40],
      profList: { l: 2 },
      bonusCost: [10, 20, 30],
      branch: 'scout',
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const bonus = this.effect[initiatorSkillLvl - 1] ?? 20;

    const dex = initiator.stats.val('attributes.dex');
    const con = initiator.stats.val('attributes.con');
    const healValue = Math.max(1, (0.5 * dex + 0.3 * con) * (1 + bonus / 100));

    this.status.effect = floatNumber(healValue * initiator.proc);
    effectService.heal(this.context);
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} на ${bold(args.target.nick)} исцелив *${args.effect}* HP`;
  }
}

export const fieldMedic = new FieldMedic();
export default fieldMedic;
