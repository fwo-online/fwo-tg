import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Вторая жизнь
 * Основное описание магии общее требовани есть в конструкторе
 */
class SecondLife extends CommonMagic {
  constructor() {
    super({
      name: 'secondLife',
      displayName: 'Вторая жизнь',
      desc: 'Воскрешает цель',
      cost: 20,
      baseExp: 8,
      costType: 'mp',
      lvl: 3,
      orderType: 'team',
      aoeType: 'target',
      magType: 'good',
      chance: [
        '1d60+30',
        '1d70+40',
        '1d80+50'], //  effect: ['1d4+2', '1d3+3', '1d2+4'],
      profList: ['p'],
      effect: [],
    });
  }

  calculateExp(effect: number, baseExp = 0) {
    return Math.round(effect * baseExp * this.params.initiator.proc);
  }

  run() {
    const { target } = this.params;
    const hp = target.stats.val('hp');

    if (hp <= 0) {
      target.stats.set('hp', 0.05);
      target.resetKiller();
      this.status.effect = Math.abs(hp);
    }
  }
}

export default new SecondLife();
