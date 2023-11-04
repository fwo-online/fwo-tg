import { LongDmgMagic } from '../Constuructors/LongDmgMagicConstructor';

/**
 * Ледяное прикосновение
 * Основное описание магии общее требовани есть в конструкторе
 */
class Blight extends LongDmgMagic {
  constructor() {
    super({
      name: 'blight',
      displayName: 'Истощение',
      desc: 'Истощает цель, заставляя ей терять жизни.',
      cost: 14,
      baseExp: 8,
      costType: 'mp',
      lvl: 4,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d10+5', '1d10+10', '1d10+15'],
      dmgType: 'physical',
      profList: ['m'],
    });
  }

  run() {
    const { target } = this.params;
    const hp = target.stats.val('hp');
    const effectVal = this.effectVal();
    const hit = hp * (effectVal / 100);

    this.status.hit = hit;
    target.stats.down('hp', hit);
  }

  runLong() {
    const { target } = this.params;
    const hp = target.stats.val('hp');
    const effectVal = this.effectVal();
    const hit = hp * (effectVal / 100);

    this.status.hit = hit;
    target.stats.down('hp', hit);
  }
}

export default new Blight();
