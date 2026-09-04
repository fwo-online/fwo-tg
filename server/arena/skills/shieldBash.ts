import { OrderType } from '@fwo/shared';
import type { ActionType } from '@/arena/Constuructors/types';
import { stun } from '@/arena/effects';
import { effectService } from '@/arena/EffectService';
import CastError from '@/arena/errors/CastError';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';

const shieldTypes = ['shield'];

/**
 * 🛡️💥 Удар щитом
 * Наносит дробящий урон от силы и защиты щита и с шансом оглушает цель
 */
class ShieldBash extends Skill {
  actionType: ActionType = 'phys';
  stunChance = [50, 65, 80];

  constructor() {
    super({
      name: 'shieldBash',
      displayName: '🛡️ Удар щитом',
      desc: 'Сокрушительный удар щитом: наносит физический урон и может оглушить противника (требуется наличие щита)',
      cost: [10, 12, 14],
      proc: 10,
      baseExp: 25,
      costType: 'en',
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [75, 85, 95],
      effect: [15, 25, 35],
      profList: { w: 2 },
      bonusCost: [10, 20, 30],
      branch: 'guardian',
    });
  }

  run() {
    const { initiator, target } = this.params;
    const shield = initiator.offHand.item;
    if (!shield || !initiator.offHand.isOfType(shieldTypes)) {
      throw new CastError('NO_SHIELD');
    }

    const initiatorSkillLvl = initiator.skills[this.name] || 1;
    const bonus = this.effect[initiatorSkillLvl - 1] ?? 15;
    const str = initiator.stats.val('attributes.str');
    const shieldDef = shield.phys.defence ?? 0;
    const baseDamage = Math.max(1, (0.5 * str + 0.3 * shieldDef) * (1 + bonus / 100));

    this.status.effect = floatNumber(baseDamage * initiator.proc);

    const chance = this.stunChance[initiatorSkillLvl - 1] ?? 50;
    if (MiscService.rndm('1d100') <= chance) {
      target.affects.addEffect({
        action: stun.name,
        initiator,
        onBeforeAction(ctx, action, affect) {
          stun.onBeforeAction(ctx, action, affect);
        },
      });
    }

    effectService.damage(this.context, this);
    this.calculateExp();
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)} по ${bold(args.target.nick)} нанеся *${args.effect}* урона`;
  }
}

export const shieldBash = new ShieldBash();
export default shieldBash;
