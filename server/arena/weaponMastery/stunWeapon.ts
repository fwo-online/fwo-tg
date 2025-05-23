import type { ActionType } from '@/arena/Constuructors/types';
import CounterEvasionSkill from './constructors/counterEvasionSkill';

class StunWeapon extends CounterEvasionSkill {
  weaponTypes = ['stun'];
  affectedActionTypes: ActionType[] = ['protect'];

  constructor() {
    super({
      name: 'stunWeapon',
      displayName: 'Владение оглушающим оружием',
      description: 'Дает бонусы оглушающему оружию, повышая урон при атаке оглушающим оружием',
      chance: [5, 10, 15, 20, 25, 30],
      effect: [3, 6, 9, 12, 15, 18],
      bonusCost: [30, 60, 90, 120, 150, 180],
    });
  }
}

export default new StunWeapon();
