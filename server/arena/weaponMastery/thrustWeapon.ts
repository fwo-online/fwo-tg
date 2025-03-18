import type { ActionType } from '@/arena/Constuructors/types';
import CounterEvasionSkill from './constructors/counterEvasionSkill';

class ThrustWeapon extends CounterEvasionSkill {
  weaponTypes = ['thrust'];
  affectedActionType: ActionType = 'dodge';

  constructor() {
    super({
      name: 'thrustWeapon',
      displayName: 'Навык владения колющим оружием',
      description:
        'Дает бонусы колящему оружию, снижая вероятность промаха при использовании оружия такого типа.',
      chance: [55, 60, 65, 70, 75, 80],
      effect: [3, 6, 9, 12, 15, 18],
      bonusCost: [30, 60, 90, 120, 150, 180],
    });
  }
}

export default new ThrustWeapon();
