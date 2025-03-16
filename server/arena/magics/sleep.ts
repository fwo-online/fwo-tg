import type { Affect } from '../Constuructors/interfaces/Affect';
import { LongMagic } from '../Constuructors/LongMagicConstructor';
import CastError from '../errors/CastError';

/**
 * Сон
 * Основное описание магии общее требовани есть в конструкторе
 */
class Sleep extends LongMagic implements Affect {
  constructor() {
    super({
      name: 'sleep',
      displayName: 'Усыпление',
      desc: 'Цель засыпает магическим сном и не может: атаковать, лечить, защищать, использовать скиллы',
      cost: 16,
      baseExp: 20,
      costType: 'mp',
      lvl: 4,
      orderType: 'enemy',
      aoeType: 'target',
      magType: 'bad',
      chance: ['1d80', '1d90', '1d100'],
      profList: ['m'],
      effect: [],
    });
  }

  run() {
    const { target } = this.params;
    target.flags.isSleeping = true;
  }

  runLong() {
    const { target } = this.params;
    target.flags.isSleeping = true;
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator, target, game } }): undefined => {
    if (initiator.flags.isSleeping) {
      throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
    }
  };
}

export default new Sleep();
