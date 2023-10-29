import { floatNumber } from '@/utils/floatNumber';
import { bold, italic } from '@/utils/formatString';
import arena from '..';
import type { PreAffect } from '../Constuructors/PreAffect';
import { Skill } from '../Constuructors/SkillConstructor';
import { SuccessArgs } from '../Constuructors/types';
import MiscService from '../MiscService';

/**
 * Увертка
 */
class Dodge extends Skill implements PreAffect {
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
    initiator.flags.isDodging = this.effect[initiatorSkillLvl - 1] * initiator.stats.val('dex');
  }

  check({ initiator, target, game } = this.params) {
    const iDex = initiator.stats.val('dex');
    if (!initiator.weapon) {
      return;
    }
    const weapon = arena.items[initiator.weapon.code];
    const isDodgeableWeapon = MiscService.weaponTypes[weapon.wtype].dodge;

    if (target.flags.isDodging && isDodgeableWeapon) {
      const at = floatNumber(Math.round(target.flags.isDodging / iDex));
      console.log('Dodging: ', at);
      const r = MiscService.rndm('1d100');
      const c = Math.round(Math.sqrt(at) + (10 * at) + 5);
      console.log('left:', c, ' right:', r, ' result:', c > r);
      if (c > r) {
        this.getExp(target);

        return this.getSuccessResult({ initiator: target, target: initiator, game });
      }
    }
  }

  customMessage(args: SuccessArgs) {
    return `${bold(args.initiator)} использовал ${italic(this.displayName)}`;
  }
}

export default new Dodge();
