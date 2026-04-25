import { OrderType } from '@fwo/shared';
import { effectService } from '@/arena/EffectService';
import { bold } from '../../utils/formatString';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Опутывание
 * Основное описание магии общее требовани есть в конструкторе
 */
class Entangle extends CommonMagic {
  constructor() {
    super({
      name: 'entangle',
      displayName: 'Опутывание',
      desc: 'Уменьшает защиту цели.',
      cost: 3,
      baseExp: 6,
      costType: 'mp',
      lvl: 1,
      orderType: OrderType.Enemy,
      aoeType: 'target',
      magType: 'bad',
      chance: [100, 100, 100],
      effect: ['1d2+4', '1d2+5', '1d2+6'],
      profList: ['p'],
    });
  }

  run() {
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);
  }

  // eslint-disable-next-line class-methods-use-this
  customMessage(args: SuccessArgs) {
    const { initiator, target, effect } = args;
    const effectStr = effect?.toString() || '';
    return `${bold(initiator.nick)} опутывает ${bold(target.nick)} снижая защиту на ${bold(effectStr)}pt`;
  }
}

export default new Entangle();
