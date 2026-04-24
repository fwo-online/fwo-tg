import { OrderType } from '@fwo/shared';
import { effectService } from '@/arena/EffectService';
import { bold, italic } from '../../utils/formatString';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Камнепад
 * Основное описание магии общее требовани есть в конструкторе
 */
class Rockfall extends DmgMagic {
  constructor() {
    super({
      name: 'rockfall',
      displayName: 'Камнепад',
      desc: 'Наносит повреждение цели.',
      cost: 3,
      baseExp: 16,
      costType: 'mp',
      lvl: 1,
      orderType: OrderType.Enemy,
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2', '1d2+1', '1d2+2'],
      dmgType: 'physical',
      profList: ['p'],
    });
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);
  }

  customMessage(args: SuccessArgs) {
    const { initiator, target } = args;
    return `${bold(initiator.nick)} обрушивает ${italic(this.displayName)} на ${bold(target.nick)}`;
  }
}

export default new Rockfall();
