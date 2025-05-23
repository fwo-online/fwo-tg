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
      chance: ['1d80+20', '1d40+60', '1d20+80'],
      profList: ['p'],
      effect: [],
    });
  }

  run() {
    const { initiator, game } = this.params;
    // выставляем глобальный флаг затмения
    game.flags.global.isEclipsed.push({ initiator });
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator: target, game } }): undefined => {
    if (game.flags.global.isEclipsed.length) {
      throw new CastError(
        game.flags.global.isEclipsed.map(({ initiator }) =>
          this.getSuccessResult({ initiator, target, game }),
        ),
      );
    }
  };
}

export default new Eclipse();
