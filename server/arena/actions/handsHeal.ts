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
    this.status.effect = this.effectVal();
    target.stats.up('hp', this.status.effect);
    target.flags.isHealed.push({
      initiator: initiator.id, val: this.status.effect,
    });
  }
}

export default new HandsHeal();
