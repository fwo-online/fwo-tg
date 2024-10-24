import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { Affect } from '../Constuructors/interfaces/Affect';

/**
 * Глюки
 * Основное описание магии общее требовани есть в конструкторе
 */
class Glitch extends CommonMagic implements Affect {
  constructor() {
    super({
      name: 'glitch',
      displayName: 'Глюки',
      desc: 'Глюки, вводит цель в замешательство, цель атакуют любого из игроков',
      cost: 12,
      baseExp: 80,
      costType: 'mp',
      lvl: 2,
      orderType: 'all',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d80', '1d90', '1d100'],
      profList: ['m'],
      effect: [],
    });
  }

  run() {
    const { target } = this.params;
    target.flags.isGlitched = true;
  }

  preAffect: Affect['preAffect'] = ({ params }): undefined => {
    if (params.initiator.flags.isGlitched) {
      params.target = params.game.players.randomAlive;
    }
  };
}

export default new Glitch();
