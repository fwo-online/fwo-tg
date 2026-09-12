import type { ActionType, SuccessArgs } from '@/arena/Constuructors/types';
import CounterEvasionSkill from '@/arena/weaponMastery/constructors/counterEvasionSkill';
import { bold, italic } from '@/utils/formatString';

/**
 * 🎯 Орлиный глаз
 * Зоркий глаз лучника снижает шанс промаха при стрельбе из дальнобойного оружия
 */
class EagleEye extends CounterEvasionSkill {
  weaponTypes = ['range'];
  affectedActionTypes: ActionType[] = ['miss'];

  constructor() {
    super({
      name: 'eagleEye',
      displayName: '🎯 Орлиный глаз',
      description: 'Зоркий глаз лучника снижает шанс промаха при стрельбе из дальнобойного оружия',
      chance: [60, 75, 90],
      effect: [1, 1, 1],
      profList: { l: 1 },
      bonusCost: [10, 20, 30],
      branch: 'marksman',
      branches: ['marksman'],
    });
  }

  customMessage(args: SuccessArgs) {
    return `${italic(args.action)} ${bold(args.initiator.nick)} скорректировал выстрел и не промахнулся!`;
  }
}

export const eagleEye = new EagleEye();
export default eagleEye;
