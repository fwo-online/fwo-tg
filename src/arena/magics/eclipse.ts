import { CommonMagic } from '../Constuructors/CommonMagicConstructor';

/**
 * Затмение
 * Основное описание магии общее требовани есть в конструкторе
 */
class Eclipse extends CommonMagic {
  constructor() {
    super({
      name: 'eclipse',
      displayName: 'Затмение',
      desc: 'Погружает арену во тьму, не позволяя атаковать',
      cost: 16,
      baseExp: 80,
      costType: 'mp',
      lvl: 2,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d80', '1d90+5', '1d100+5'],
      profList: ['p'],
      effect: [],
    });
  }

  run() {
    const { game } = this.params;
    // выставляем глобальный флаг затмения
    game.round.flags.global.isEclipsed = true;
  }
}

export default new Eclipse();
