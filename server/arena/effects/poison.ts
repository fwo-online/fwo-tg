import { EffectType, OrderType } from '@fwo/shared';
import type { DmgMagicArgs } from '@/arena/Constuructors/DmgMagicConstructor';
import { LongDmgMagic } from '@/arena/Constuructors/LongDmgMagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import type { Player } from '@/arena/PlayersService';
import { bold, italic } from '@/utils/formatString';

/**
 * ☠️ Отравление
 * Периодический урон ядом (кислотой)
 */
const params: DmgMagicArgs = Object.freeze({
  name: 'poison',
  displayName: '☠️ Отравление',
  desc: 'Цель отравлена и получает периодический урон ядом.',
  cost: 0,
  baseExp: 8,
  costType: 'mp',
  lvl: 0,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: [100],
  effect: ['1d3'],
  dmgType: EffectType.Acid,
  profList: ['m', 'w', 'l', 'p'],
});

class Poison extends LongDmgMagic {
  cast(initiator: Player, target: Player, game: GameService): void {
    if (target.stats.val('hp') <= 0) {
      return;
    }
    super.cast(initiator, target, game);
  }

  override getEffectVal({ initiator } = this.params): number {
    const formula = this.effect[0];
    return MiscService.dice(formula) * (initiator.proc || 1);
  }

  run() {
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);
  }

  customMessage(args: SuccessArgs): string {
    const { initiator, target } = args;
    return `${italic(this.displayName)} (${bold(initiator.nick)}) наносит урон ядом игроку ${bold(target.nick)}`;
  }
}

export const poison = new Poison(params);
export default poison;
