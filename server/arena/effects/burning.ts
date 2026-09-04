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
 * 🔥 Горение
 * Периодический урон огнём
 */
const params: DmgMagicArgs = Object.freeze({
  name: 'burning',
  displayName: '🔥 Горение',
  desc: 'Цель охвачена пламенем и получает периодический урон огнём.',
  cost: 0,
  baseExp: 8,
  costType: 'mp',
  lvl: 0,
  orderType: OrderType.Enemy,
  aoeType: 'target',
  magType: 'bad',
  chance: [100, 100, 100],
  effect: ['1d2', '1d3', '1d4'],
  dmgType: EffectType.Fire,
  profList: ['m', 'w', 'l', 'p'],
});

class Burning extends LongDmgMagic {
  damageValue?: number;

  cast(initiator: Player, target: Player, game: GameService, damage?: number): void {
    if (target.stats.val('hp') <= 0) {
      return;
    }
    this.damageValue = damage;
    super.cast(initiator, target, game);
  }

  override getEffectVal({ initiator } = this.params): number {
    const lvl = initiator.getPassiveSkillLevel('ignition') || 1;
    const formula = this.effect[lvl - 1] ?? this.effect[0];
    return MiscService.dice(formula) * (initiator.proc || 1);
  }

  run() {
    this.status.effect = this.damageValue !== undefined && this.damageValue > 0
      ? this.damageValue
      : this.effectVal();
    effectService.damage(this.context, this);
  }

  override reset() {
    super.reset();
    this.damageValue = undefined;
  }

  customMessage(args: SuccessArgs): string {
    const { initiator, target } = args;
    return `${italic(this.displayName)} (${bold(initiator.nick)}) наносит урон огнём игроку ${bold(target.nick)}`;
  }
}

export const burning = new Burning(params);
