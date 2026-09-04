import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import CastError from '@/arena/errors/CastError';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * 🎯 Смертоносный выстрел
 * Добивающий выстрел: наносит повышенный урон, а по цели с менее 35% HP наносит удвоенный критический урон
 */
class FatalShot extends Skill {
  actionType: ActionType = 'phys';
  weaponTypes = ['range'];
  threshold = 0.35;

  constructor() {
    super({
      name: 'fatalShot',
      displayName: '🎯 Смертоносный выстрел',
      desc: 'Добивающий выстрел из лука: наносит удвоенный урон по раненому противнику (<35% HP)',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 30,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [75, 85, 95],
      effect: [50, 75, 100],
      profList: { l: 4 },
      bonusCost: [10, 20, 30],
      branch: 'marksman',
    });
  }

  run() {
    const { initiator, target } = this.params;
    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }

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

export const fatalShot = new FatalShot();
export default fatalShot;
