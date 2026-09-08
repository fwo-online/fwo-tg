import { EffectType, OrderType } from '@fwo/shared';
import type { DmgMagicArgs } from '@/arena/Constuructors/DmgMagicConstructor';
import { LongDmgMagic } from '@/arena/Constuructors/LongDmgMagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import MiscService from '@/arena/MiscService';
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
  chance: [100],
  effect: ['1d3'],
  dmgType: EffectType.Fire,
  profList: ['m', 'w', 'l', 'p'],
});

class Burning extends LongDmgMagic {
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
    return `${italic(this.displayName)} (${bold(initiator.nick)}) наносит урон огнём игроку ${bold(target.nick)}`;
  }
}

export const burning = new Burning(params);
export default burning;
