import { floatNumber } from '../../utils/floatNumber';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { HealMagicNext } from '../Constuructors/HealMagicConstructor';

export class HealMagic extends CommonMagic {
  status = {
    exp: 0,
    effect: 0,
  };

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

  next(): void {
    const { target, initiator, game } = this.params;
    const args: HealMagicNext = {
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'heal-magic',
      target: target.nick,
      hp: target.stats.val('hp'),
      initiator: initiator.nick,
      effect: this.status.effect,
      msg: this.customMessage?.bind(this),
    };

    game.recordOrderResult(args);
  }
}
