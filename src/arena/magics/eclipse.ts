import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { Affect } from '../Constuructors/interfaces/Affect';
import CastError from '../errors/CastError';

/**
 * Затмение
 * Основное описание магии общее требовани есть в конструкторе
 */
class Eclipse extends CommonMagic implements Affect {
  constructor() {
    super({
      name: 'eclipse',
      displayName: 'Затмение',
      desc: 'Погружает арену во тьму, не позволяя атаковать',
      cost: 16,
      baseExp: 80,
      costType: 'mp',
      lvl: 3,
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
    game.flags.global.isEclipsed = true;
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator, target, game } }) => {
    if (game.flags.global.isEclipsed) {
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  };
}

export default new Eclipse();
