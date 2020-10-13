import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import floatNumber from '../floatNumber';
import Player from '../PlayerService';

export class Heal extends CommonMagic {
  status = {
    exp: 0,
    effect: 0,
  }

  run(): void {
    const { target } = this.params;
    const maxHP = target.stats.val('maxHp'); // показатель максимального HP
    const realHP = target.stats.val('hp'); // показатель текущего HP
    const maxHeal = maxHP - realHP;
    this.status.effect = floatNumber(Math.min(this.effectVal(), maxHeal));
    target.stats.mode('up', 'hp', this.status.effect);
  }
  /**
   * @param {player} initiator
   */
  getExp(initiator: Player): void {
    this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
    initiator.stats.mode('up', 'exp', this.status.exp);
  }
}
