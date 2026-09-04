import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🪓 Казнь
 * Добивающий удар оружием: наносит сокрушительный урон, если у цели меньше 35% HP
 */
class Execute extends Skill {
  actionType: ActionType = 'phys';
  threshold = 0.35;

  constructor() {
    super({
      name: 'execute',
      displayName: '🪓 Казнь',
      desc: 'Сокрушительный добивающий удар: наносит значительно повышенный урон противнику с менее 35% здоровья',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 30,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [75, 85, 95],
      effect: [50, 75, 100],
      profList: { w: 4 },
      bonusCost: [10, 20, 30],
      branch: 'berserker',
    });
  }

  run() {
    const { initiator, target } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const bonus = this.effect[initiatorSkillLvl - 1] ?? 50;

    const { min, max } = initiator.stats.val('hit');
    let hit = MiscService.randFloat(min, max);

    const maxHp = target.stats.val('base.hp');
    const curHp = target.stats.val('hp');

    if (maxHp > 0 && curHp / maxHp < this.threshold) {
      hit = hit * (1 + bonus / 100);
    }

    this.status.effect = floatNumber(hit * initiator.proc);
    effectService.damage(this.context, this);
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} по ${bold(args.target.nick)} нанеся *${args.effect}* урона`;
  }
}

export const execute = new Execute();
export default execute;
