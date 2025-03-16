import { floatNumber } from '../../utils/floatNumber';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { ActionType } from '../Constuructors/types';

export class HealMagic extends CommonMagic {
  actionType: ActionType = 'heal-magic';

  run(): void {
    const { target } = this.params;
    const maxHP = target.stats.val('base.hp'); // показатель максимального HP
    const realHP = target.stats.val('hp'); // показатель текущего HP
    const maxHeal = maxHP - realHP;
    this.status.effect = floatNumber(Math.min(this.effectVal(), maxHeal));
    target.stats.mode('up', 'hp', this.status.effect);
  }

  /**
   * @param initiator
   */
  calculateExp({ initiator } = this.params): void {
    this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
  }

  checkTargetIsDead({ target } = this.params) {
    const hpNow = target.stats.val('hp');
    if (hpNow > 0 && target.getKiller()) {
      target.resetKiller();
    }
  }
}
