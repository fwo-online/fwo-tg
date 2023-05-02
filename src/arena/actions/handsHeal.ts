import { Heal } from '../Constuructors/HealMagicConstructor';
import type Game from '../GameService';
import type { Player } from '../PlayersService';
/**
 * Хил руками
 */
const params = {
  name: 'handsHeal',
  desc: 'Лечение руками. Действие может быть прервано физической атакой',
  displayName: 'Лечение руками',
  lvl: 0,
  orderType: 'all',
} as const;

class HandsHeal extends Heal {
  constructor() {
    super(params);
  }

  run(initiator: Player, target: Player, _game: Game): void {
    if (target.flags.isHited) {
      throw this.breaks('HEAL_FAIL');
    } else {
      this.status.val = this.effectVal();
      target.stats.up('hp', this.status.val);
      target.flags.isHealed.push({
        initiator: initiator.id, val: this.status.val,
      });
    }
  }
}

export default new HandsHeal();
