import { shuffle } from 'es-toolkit';
import { AoeDmgMagic } from '../Constuructors/AoeDmgMagicConstructor';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';

/**
 * Огненный дождь
 * Основное описание магии общее требовани есть в конструкторе
 */
class FireRain extends AoeDmgMagic {
  constructor() {
    super({
      name: 'fireRain',
      displayName: 'Огненный дождь',
      desc: 'Обрушивает на команду противника огненный дождь',
      cost: 18,
      baseExp: 8,
      costType: 'mp',
      lvl: 3,
      orderType: 'enemy',
      aoeType: 'team',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2', '1d2+2', '1d2+4'],
      dmgType: 'fire',
      profList: ['m'],
    });
  }

  getTargets(): Player[] {
    const { target, game } = this.params;

    return shuffle(game.players.getAliveAllies(target));
  }

  /**
   * Основная функция запуска магии
   */
  run(initiator: Player, target: Player, game: GameService): void {
    const effect = this.effectVal();
    target.stats.down('hp', effect);

    const targets = this.getTargets();

    targets.forEach((target) => {
      this.runAoe(initiator, target, game);
    });
  }

  runAoe(initiator: Player, target: Player, game: GameService) {
    const effect = this.effectVal({ initiator, target, game });
    target.stats.down('hp', effect);

    this.status.expArr.push({
      initiator,
      target,
      val: effect,
      hp: target.stats.val('hp'),
    });
  }
}

export default new FireRain();
