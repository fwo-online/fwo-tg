import { Heal } from '../Constuructors/HealMagicConstructor';
import type Game from '../GameService';
import type Player from '../PlayerService';
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
      throw new Error('HEAL_FAIL');
    } else {
      this.status.val = this.effectVal();
      target.flags.isHealed.push({
        initiator: initiator.id, val: this.status.val,
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  next() {
    //
  }
}

export default new HandsHeal();
