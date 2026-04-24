import { OrderType } from '@fwo/shared';
import { effectService } from '@/arena/EffectService';
import { Heal } from '../Constuructors/HealMagicConstructor';

/**
 * Хил руками
 */
const params = {
  name: 'handsHeal' as const,
  desc: 'Лечение руками. Действие может быть прервано физической атакой',
  displayName: 'Лечение руками',
  lvl: 0,
  orderType: OrderType.All,
} as const;

class HandsHeal extends Heal {
  constructor() {
    super(params);
  }

  run(): void {
    this.effectVal();
    effectService.heal(this.context);
  }
}

export default new HandsHeal();
