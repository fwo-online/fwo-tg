import IncreaseEffectSkill from './constructors/increaseEffectSkill';

class ChopWeapon extends IncreaseEffectSkill {
  weaponTypes = ['h'];

  constructor() {
    super({
      name: 'chopWeapon',
      displayName: 'Навык владения рубящим оружием',
      chance: [5, 10, 15, 20, 25, 30],
      effect: [3, 6, 9, 12, 15, 18],
      bonusCost: [30, 60, 90, 120, 150, 180],
    });
  }
}

export default new ChopWeapon();
