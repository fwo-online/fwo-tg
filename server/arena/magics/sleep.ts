import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, italic } from '@/utils/formatString';
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
      chance: ['1d80+20', '1d40+60', '1d20+80'],
      profList: ['m'],
      effect: ['1d1', '1d1', '1d1'],
    });
  }

  run() {
    const { initiator, target } = this.params;

    target.flags.isSleeping.push({ initiator, val: this.effectVal() });
  }

  runLong() {
    const { initiator, target } = this.params;
    target.flags.isSleeping.push({ initiator, val: this.effectVal() });
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

  customMessage({ initiator, target }: SuccessArgs): string {
    return `${bold(initiator.nick)} заклинанием ${italic(this.displayName)} заставил ${bold(target.nick)} заснуть на этот раунд`;
  }

  customLongMessage({ initiator, target }: SuccessArgs): string {
    return `${bold(initiator.nick)} заклинанием ${italic(this.displayName)} заставил ${bold(target.nick)} заснуть на этот раунд`;
  }
}

export default new Sleep();
