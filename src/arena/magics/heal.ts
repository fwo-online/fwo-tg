import { floatNumber } from '../../utils/floatNumber';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { ActionType } from '../Constuructors/types';

export class HealMagic extends CommonMagic {
  actionType: ActionType = 'heal-magic';

  run(): void {
    const { target } = this.params;
    const maxHP = target.stats.val('maxHp'); // показатель максимального HP
    const realHP = target.stats.val('hp'); // показатель текущего HP
    const maxHeal = maxHP - realHP;
    this.status.effect = floatNumber(Math.min(this.effectVal(), maxHeal));
    target.stats.mode('up', 'hp', this.status.effect);
  }

  /**
   * @param initiator
   */
  getExp({ initiator } = this.params): void {
    this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
    initiator.stats.mode('up', 'exp', this.status.exp);
  }

  checkTargetIsDead({ target } = this.params) {
    const hpNow = target.stats.val('hp');
    if (hpNow > 0 && target.getKiller()) {
      target.resetKiller();
    }
  }
}
