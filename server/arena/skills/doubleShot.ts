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
 * 🏹 Залп стрел
 * Быстрый залп из двух стрел по противникам
 */
class DoubleShot extends Skill {
  actionType: ActionType = 'phys';
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'doubleShot',
      displayName: '🏹 Залп стрел',
      desc: 'Быстрый залп двумя стрелами по противникам',
      cost: [12, 14, 16],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [80, 85, 90],
      effect: [60, 75, 90],
      profList: { l: 2 },
      bonusCost: [10, 20, 30],
      branch: 'barrage',
    });
  }

  run() {
    const { initiator, target, game } = this.params;
    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }

    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const arrowPercent = this.effect[initiatorSkillLvl - 1] ?? 75;

    const { min, max } = initiator.stats.val('hit');
    const hit1 = MiscService.randFloat(min, max) * (arrowPercent / 100);
    this.status.effect = floatNumber(hit1 * initiator.proc);
    effectService.damage(this.context, this);

    const aliveEnemies = game.players.getAliveEnemies(initiator);
    const target2 = aliveEnemies.find((e) => e.id !== target.id) ?? target;

    if (target2.stats.val('hp') > 0) {
      const hit2 = MiscService.randFloat(min, max) * (arrowPercent / 100);
      const ctx2 = this.context.cloneWith(target2);
      ctx2.status.effect = floatNumber(hit2 * initiator.proc);
      effectService.damage(ctx2, this);
    }

    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} нанеся *${args.effect}* урона`;
  }
}

export const doubleShot = new DoubleShot();
export default doubleShot;
