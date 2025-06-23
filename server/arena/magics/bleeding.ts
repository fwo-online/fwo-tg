import { LongDmgMagic } from '@/arena/Constuructors/LongDmgMagicConstructor';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, italic } from '@/utils/formatString';

class Bleeding extends LongDmgMagic {
  constructor() {
    super({
      name: 'bleeding',
      displayName: '🩸Кровотечение',
      desc: 'Кровотечение наносит урон в течение нескольких ходов',
      cost: 0,
      baseExp: 8,
      costType: 'mp',
      lvl: 4,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d100', '1d100', '1d100'],
      effect: ['1d3', '1d5', '1d9'],
      dmgType: 'physical',
      profList: ['w'],
    });
  }

  run() {
    const { target } = this.params;
    this.status.effect = this.effectVal();
    target.stats.down('hp', this.status.effect);
  }

  runLong() {
    this.run();
  }

  longCustomMessage(args: SuccessArgs): string {
    return `${bold(args.initiator.nick)} вызвал эффект ${italic(this.displayName)} на ${bold(args.target.nick)}, нанеся ${args.effect} урона`;
  }
}

export default new Bleeding();
