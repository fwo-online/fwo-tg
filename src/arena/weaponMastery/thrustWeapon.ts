import type { ActionType } from '@/arena/Constuructors/types';
import CounterEvasionSkill from './constructors/counterEvasionSkill';

class ThrustWeapon extends CounterEvasionSkill {
  weaponTypes = ['s'];
  affectedActionType: ActionType = 'dodge';

  constructor() {
    super({
      name: 'thrustWeapon',
      displayName: 'Навык владения колющим оружием',
      chance: [55, 60, 65, 70, 75, 80],
      effect: [3, 6, 9, 12, 15, 18],
      bonusCost: [30, 60, 90, 120, 150, 180],
    });
  }
}

export default new ThrustWeapon();
