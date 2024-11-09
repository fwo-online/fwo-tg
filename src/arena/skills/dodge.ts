import { bold, italic } from '@/utils/formatString';
import type { Affect } from '../Constuructors/interfaces/Affect';
import { Skill } from '../Constuructors/SkillConstructor';
import type { ActionType, SuccessArgs } from '../Constuructors/types';
import CastError from '../errors/CastError';
import MiscService from '../MiscService';

const dodgeableWeaponTypes = [
  's', // колющее
  'c', // режущее
  'h', // рубящее
  'l', // метательное
  'd', // оглушающее
];

/**
 * Увертка
 */
class Dodge extends Skill implements Affect {
  actionType: ActionType = 'dodge';

  constructor() {
    super({
      name: 'dodge',
      displayName: '🐍 Увертка',
      desc: 'Шанс увернуться от одной или нескольких атак(только против колющего, режущего, рубящего, метательного, оглушающего оружия)',
      cost: [10, 12, 14, 16, 18, 20],
      proc: 20,
      baseExp: 50,
      costType: 'en',
      orderType: 'self',
      aoeType: 'target',
      chance: [75, 80, 85, 90, 95, 99],
      effect: [1.2, 1.25, 1.3, 1.35, 1.4, 1.45],
      profList: { l: 2 },
      bonusCost: [10, 20, 30, 40, 60, 80],
    });
  }

  run() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name];
    initiator.flags.isDodging = this.effect[initiatorSkillLvl - 1] * initiator.stats.val('attributes.dex');
  }

  preAffect: Affect['preAffect'] = ({ params: { initiator, target, game } }): undefined => {
    const isDodgeable = initiator.weapon.isOfType(dodgeableWeaponTypes);

    if (target.flags.isDodging && isDodgeable) {
      const initiatorDex = initiator.stats.val('attributes.dex');
      const dodgeFactor = Math.round(target.flags.isDodging / initiatorDex);
      const chance = Math.round(Math.sqrt(dodgeFactor) + (10 * dodgeFactor) + 5);

      if (chance > MiscService.rndm('1d100')) {
        this.calculateExp();

        throw new CastError(this.getSuccessResult({ initiator: target, target: initiator, game }));
      }
    }
  };

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator.nick)} использовал ${italic(this.displayName)}`;
  }
}

export default new Dodge();
