import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Затмение
 * Основное описание магии общее требовани есть в конструкторе
 */
class SecondLife extends CommonMagic {
  constructor() {
    super({
      // @ts-expect-error не используется
      name: 'secondLife',
      displayName: 'Вторая жизнь',
      desc: 'Воскрешает цель',
      cost: 20,
      baseExp: 8,
      costType: 'mp',
      lvl: 3,
      orderType: 'all',
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

  // eslint-disable-next-line class-methods-use-this
  run() {
    // if hp < 0 , wasHP = |hp|
    // set hp 0.05
    // set exp wasHP * baseExp
  }
}

export default new SecondLife();
