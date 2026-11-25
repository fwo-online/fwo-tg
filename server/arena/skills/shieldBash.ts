import { OrderType } from '@fwo/shared';
import { Skill } from '@/arena/Constuructors/SkillConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { stun } from '@/arena/effects/stun';
import CastError from '@/arena/errors/CastError';
import { bold, italic } from '@/utils/formatString';

class ShieldBash extends Skill {
  constructor() {
    super({
      name: 'shieldBash',
      displayName: 'Удар щитом',
      desc: 'Требует щит в свободной руке. С шансом оглушает противника до конца текущего раунда, прерывая его последующие действия. Не наносит урона.',
      cost: [10, 12, 14],
      costType: 'en',
      proc: 25,
      baseExp: 0,
      orderType: OrderType.Enemy,
      aoeType: 'target',
      chance: [50, 65, 75],
      effect: [1, 1, 1],
      profList: { w: 1 },
      bonusCost: [10, 20, 30],
      branch: 'guardian',
    });
  }

  override fitsCheck(): void {
    super.fitsCheck();
    if (!this.params.initiator.offHand.isOfType(['shield'])) {
      throw new CastError('NO_SHIELD');
    }
  }

  run() {
    const { initiator, target } = this.params;
    target.affects.addEffect({
      action: stun.name,
      initiator,
      onBeforeAction(ctx, action, affect) {
        stun.onBeforeAction(ctx, action, affect);
      },
    });
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} оглушил ${bold(args.target.nick)} умением ${italic(this.displayName)}`;
  }
}

export const shieldBash = new ShieldBash();
