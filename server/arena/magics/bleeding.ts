import { OrderType } from '@fwo/shared';
import { LongDmgMagic } from '@/arena/Constuructors/LongDmgMagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { effectService } from '@/arena/EffectService';
import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';

class Bleeding extends LongDmgMagic {
  constructor() {
    super({
      name: 'bleeding',
      displayName: '🩸Кровотечение',
      desc: 'Кровотечение наносит урон в течение нескольких ходов',
      cost: 0,
      baseExp: 8,
      costType: 'en',
      lvl: 4,
      orderType: OrderType.Any,
      aoeType: 'target',
      magType: 'bad',
      chance: [100, 100, 100],
      effect: ['1d2', '2d4', '3d9'],
      dmgType: 'physical',
      profList: ['w'],
    });
  }

  override modifyEffect(effect: number): number {
    return floatNumber(effect);
  }

  run() {
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);
  }

  customMessage(args: SuccessArgs): string {
    return `${bold(args.initiator.nick)} вызвал эффект ${italic(this.displayName)} на ${bold(args.target.nick)}, нанеся ${args.effect} урона`;
  }
}

export default new Bleeding();
