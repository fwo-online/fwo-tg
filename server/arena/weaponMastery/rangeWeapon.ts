import type { ActionType } from '@/arena/Constuructors/types';
import CounterEvasionSkill from './constructors/counterEvasionSkill';

class RangeWeapon extends CounterEvasionSkill {
  weaponTypes = ['range'];
  affectedActionTypes: ActionType[] = ['dodge', 'miss'];

  constructor() {
    super({
      name: 'rangeWeapon',
      displayName: 'Владение дальним оружием',
      description:
        'Дает бонусы метательному и дальнобойному оружию, снижая вероятность промаха при использовании оружия такого типа',
      chance: [55, 60, 65, 70, 75, 80],
      effect: [3, 6, 9, 12, 15, 18],
      bonusCost: [30, 60, 90, 120, 150, 180],
    });
  }
}

export default new RangeWeapon();
