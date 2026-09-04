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
 * ❄️ Окоченение
 * Снижает физическую атаку цели на 2 раунда
 */
const params: MagicArgs = Object.freeze({
  name: 'frostbite',
  displayName: '❄️ Окоченение',
  desc: 'Цель скована холодом: её физическая атака снижена.',
  cost: 0,
  baseExp: 8,
  costType: 'mp',
  lvl: 0,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: [100, 100, 100],
  effect: ['10', '18', '25'],
  profList: ['m', 'w', 'l', 'p'],
});

class Frostbite extends LongMagic {
  isAffect = true;
  slowValue?: number;

  cast(initiator: Player, target: Player, game: GameService, slowPercent?: number): void {
    this.slowValue = slowPercent;
    super.cast(initiator, target, game);
  }

  run(): void {
    const { initiator, target } = this.params;
    const slowPercent = this.slowValue ?? (this.getEffectVal({ initiator }) || 15);
    this.status.effect = slowPercent;

    target.affects.addLongEffect({
      action: this.name,
      duration: 2,
      proc: initiator.proc,
      initiator,
      value: slowPercent,
      onBeforeDamageDeal(ctx, action, affect) {
        frostbite.onBeforeDamageDeal(ctx, action, affect);
      },
    });
  }

  onBeforeDamageDeal(ctx: BaseActionContext, _action: BaseAction, affect: Affect) {
    const slowPercent = affect.value ?? 15;
    ctx.status.effect = Math.round(ctx.status.effect * (1 - slowPercent / 100));
  }

  override reset() {
    super.reset();
    this.slowValue = undefined;
  }

  customMessage(args: SuccessArgs): string {
    return `${italic(this.displayName)} сковало ${bold(args.target.nick)} ${brackets(`❄️-${args.effect}% атаки`)}`;
  }
}

export const frostbite = new Frostbite(params);
export const frostBiteEffect = frostbite;
