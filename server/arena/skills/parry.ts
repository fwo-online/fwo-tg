import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import { bold, italic } from '@/utils/formatString';
import type { Affect } from '../Constuructors/interfaces/Affect';
import { Skill } from '../Constuructors/SkillConstructor';
import type { SuccessArgs } from '../Constuructors/types';
import CastError from '../errors/CastError';

const parryableWeaponTypes = [
  'thrust', // колющее
  'cut', // режущее
  'chop', // рубящее
  'stun', // оглушающее
];

/**
 * Парирование
 */
class Parry extends Skill {
  constructor() {
    super({
      name: 'parry',
      displayName: '🤺 Парирование',
      desc: 'Шанс спарировать атаку (у вас и у вашего врага должно быть оружие ближнего боя).',
      cost: [8, 9, 10, 11, 12, 13],
      proc: 10,
      baseExp: 8,
      costType: 'en',
      orderType: OrderType.Self,
      aoeType: 'target',
      chance: [70, 75, 80, 85, 90, 95],
      effect: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6],
      profList: { w: 1 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.getSkillLevel(this.name);
    const effect = this.effect[initiatorSkillLvl - 1] || 1;
    const value = initiator.stats.val('attributes.dex') * effect;
    // изменяем
    initiator.affects.addEffect({
      action: this.name,
      initiator,
      value,
      onBeforeReceive(ctx, action, affect) {
        parry.onBeforeReceive(ctx, action, affect);
      },
    });
  }

  onBeforeReceive(ctx: BaseActionContext, action: BaseAction, affect: Affect) {
    if (action.actionType !== 'phys') {
      return;
    }

    const { initiator, target, game } = ctx.params;
    const isParryable = initiator.weapon.isOfType(parryableWeaponTypes);

    if (isParryable) {
      const initiatorDex = initiator.stats.val('attributes.dex');
      affect.value ??= 0;
      affect.value -= initiatorDex;

      if (affect.value > 0) {
        this.calculateExp();

        throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
      }
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export const parry = new Parry();
