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
      effect: ['1d1', '1d1', '1d1'],
    });
  }

  run() {
    const { initiator, target } = this.params;
    target.flags.isSleeping.push({ initiator, val: 0 });
  }

  runLong() {
    const { initiator, target } = this.params;
    target.flags.isSleeping.push({ initiator, val: 0 });
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator: target, game } }): undefined => {
    if (target.flags.isHited) {
      /** @todo сделать метод в конструкторе для очистки длительных бафов */
      game.longActions.sleep = game.longActions.sleep?.filter((item) => item.target !== target.id);
      target.flags.isSleeping = [];
    }

    if (target.flags.isSleeping.length) {
      throw new CastError(
        target.flags.isSleeping.map(({ initiator }) =>
          this.getSuccessResult({
            initiator,
            target,
            game,
          }),
        ),
      );
    }
  };
}

export default new Sleep();
