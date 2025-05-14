import type { ActionType } from '@/arena/Constuructors/types';
import CounterEvasionSkill from './constructors/counterEvasionSkill';

class CutWeapon extends CounterEvasionSkill {
  weaponTypes = ['cut'];
  affectedActionTypes: ActionType[] = ['protect'];

  constructor() {
    super({
      name: 'cutWeapon',
      displayName: 'Владение режущим оружием',
      description: 'Дает бонусы режущему оружию, повышая шанс пробивания оружием такого типа',
      chance: [5, 10, 15, 20, 25, 30],
      effect: [3, 6, 9, 12, 15, 18],
      bonusCost: [30, 60, 90, 120, 150, 180],
    });
  }
}

export default new CutWeapon();
