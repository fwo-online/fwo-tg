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
 * 🏹 Град стрел
 * Массовый выстрел стрелами по всей вражеской команде
 */
class ArrowRain extends Skill {
  actionType: ActionType = 'phys';
  weaponTypes = ['range'];

  constructor() {
    super({
      name: 'arrowRain',
      displayName: '🏹 Град стрел',
      desc: 'Залп тучи стрел, накрывающий всех противников на поле боя',
      cost: [14, 16, 18],
      proc: 10,
      baseExp: 35,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'team',
      chance: [75, 80, 85],
      effect: [40, 55, 70],
      profList: { l: 3 },
      bonusCost: [10, 20, 30],
      branch: 'barrage',
    });
  }

  run() {
    const { initiator, game } = this.params;
    if (!initiator.weapon.isOfType(this.weaponTypes)) {
      throw new CastError('NO_WEAPON');
    }

    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const rainPercent = this.effect[initiatorSkillLvl - 1] ?? 50;

    const enemies = game.players.getAliveEnemies(initiator);
    const { min, max } = initiator.stats.val('hit');

    for (const enemy of enemies) {
      if (enemy.stats.val('hp') <= 0) {
        continue;
      }
      const hit = MiscService.randFloat(min, max) * (rainPercent / 100);
      const enemyCtx = this.context.cloneWith(enemy);
      enemyCtx.status.effect = floatNumber(hit * initiator.proc);
      effectService.damage(enemyCtx, this);
    }

    this.status.effect = rainPercent;
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} обрушил ${italic(this.displayName)} на врагов`;
  }
}

export const arrowRain = new ArrowRain();
export default arrowRain;
