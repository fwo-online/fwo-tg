import { OrderType } from '@fwo/shared';
import { effectService } from '@/arena/EffectService';
import { bold, italic } from '../../utils/formatString';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';
import type { SuccessArgs } from '../Constuructors/types';

/**
 * Магическая стрела
 * Основное описание магии общее требовани есть в конструкторе
 */
class MagicArrow extends DmgMagic {
  private case = 'Магической стрелой';

  constructor() {
    super({
      name: 'magicArrow',
      displayName: 'Магическая стрела',
      desc: 'Магическая стрела',
      cost: 3,
      baseExp: 8,
      costType: 'mp',
      lvl: 1,
      orderType: OrderType.Enemy,
      aoeType: 'target',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2', '1d2+1', '1d2+2'],
      dmgType: 'clear',
      profList: ['m'],
    });
  }

  /**
   * Основная функция запуска магии
   */
  run(): void {
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);
  }

  customMessage(args: SuccessArgs): string {
    const { initiator, target } = args;
    return `${bold(initiator.nick)} выстреливает ${italic(this.case)} в ${bold(target.nick)}`;
  }
}

export default new MagicArrow();
