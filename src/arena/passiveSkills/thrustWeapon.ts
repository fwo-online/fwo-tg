import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import { PassiveSkillConstructor } from '@/arena/Constuructors/PassiveSkillConstructor';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import { normalizeToArray } from '@/utils/array';

const thrustWeaponType = 's';

class ThrustWeapon extends PassiveSkillConstructor implements Affect {
  constructor() {
    super({
      name: 'thrustWeapon',
      displayName: 'Навык владения оружием',
      chance: [55, 60, 65, 70, 75, 80],
      effect: [3, 6, 9, 12, 15, 18],
      bonusCost: [30, 60, 90, 120, 150, 180],
    });
  }

  run(initiator: Player, target: Player, game: GameService) {
    this.params = { initiator, target, game };
  }

  affectHandler: Affect['affectHandler'] = ({ initiator, target, game }, affect) => {
    this.run(target, initiator, game);
    const [normalizedAffect] = normalizeToArray(affect);
    if (normalizedAffect.actionType !== 'protect') {
      return;
    }

    if (!initiator.weapon.isOfType([thrustWeaponType])) {
      return;
    }

    if (!this.checkChance() && !this.getEffect()) {
      return;
    }

    return this.getSuccessResult({ initiator, target, game });
  };
}

export default new ThrustWeapon();
