import { OrderType } from '@fwo/shared';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type { MagicArgs } from '@/arena/Constuructors/MagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import { bold, brackets, italic } from '@/utils/formatString';

/**
 * 🛡️ Священная броня
 * Повышает физическую защиту персонажа (снижает получаемый физ. урон)
 */
const params: MagicArgs = Object.freeze({
  name: 'sacredArmorEffect',
  displayName: '🛡️ Священная броня',
  desc: 'Священная броня укрепляет защиту, снижая получаемый физический урон.',
  cost: 0,
  baseExp: 8,
  costType: 'mp',
  lvl: 0,
  orderType: OrderType.Self,
  aoeType: 'target',
  magType: 'good',
  chance: [100, 100, 100],
  effect: ['15', '25', '35'],
  profList: ['p', 'm', 'w', 'l'],
});

class SacredArmorEffect extends LongMagic {
  isAffect = true;
  armorBonus?: number;

  cast(initiator: Player, target: Player, game: GameService, bonus?: number): void {
    this.armorBonus = bonus;
    super.cast(initiator, target, game);
  }

  run(): void {
    const { initiator, target } = this.params;
    const bonus = this.armorBonus ?? (this.getEffectVal(this.params) || 25);
    this.status.effect = bonus;

    target.affects.addLongEffect({
      action: this.name,
      duration: 1,
      proc: initiator.proc,
      initiator,
      value: bonus,
      onBeforeDamageRecieve(ctx, action, affect) {
        sacredArmorEffect.onBeforeDamageRecieve(ctx, action, affect);
      },
    });
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, _action: BaseAction, affect: Affect) {
    const pdefBonus = affect.value ?? 25;
    ctx.status.effect = Math.max(1, Math.round(ctx.status.effect * (1 - pdefBonus / 100)));
  }

  override reset() {
    super.reset();
    this.armorBonus = undefined;
  }

  customMessage(args: SuccessArgs): string {
    return `${italic(this.displayName)} защищает ${bold(args.target.nick)} ${brackets(`🛡️+${args.effect}% защиты`)}`;
  }
}

export const sacredArmorEffect = new SacredArmorEffect(params);
