import { effectService } from '@/arena/EffectService';
import { CommonMagic } from '../Constuructors/CommonMagicConstructor';
import type { ActionType } from '../Constuructors/types';

export class HealMagic extends CommonMagic {
  actionType: ActionType = 'heal-magic';

  run(): void {
    this.status.effect = this.effectVal();
    effectService.damage(this.context, this);
  }

  /**
   * @param initiator
   */
  calculateExp({ initiator } = this.params): void {
    this.status.exp = Math.round(this.status.effect * 10 * initiator.proc);
  }
}
