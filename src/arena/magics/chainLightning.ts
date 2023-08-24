import { floatNumber } from '@/utils/floatNumber';
import { DmgMagic } from '../Constuructors/DmgMagicConstructor';
import type { ExpArr } from '../Constuructors/types';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';
/**
 * Цепь молний
 * Основное описание магии общее требовани есть в конструкторе
 */

class ChainLightning extends DmgMagic {
  static maxTargets = [3, 4, 5];

  override status: {
    exp: number;
    expArr: ExpArr;
    hit: number;
  } = {
      exp: 0,
      hit: 0,
      expArr: [],
    };

  constructor() {
    super({
      name: 'chainLightning',
      displayName: 'Цепь молний',
      desc: 'Цепная молния повреждает выбранную цель молнией и еще одну случайно.',
      cost: 8,
      baseExp: 12,
      costType: 'mp',
      lvl: 3,
      orderType: 'any',
      aoeType: 'targetAoe',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d3+1', '1d3+2', '1d3+3'],
      dmgType: 'lighting',
      profList: ['m'],
    });
  }

  getTargets() {
    const { initiator, target, game } = this.params;
    const magicLevel = initiator.getMagicLevel(this.name);
    const maxTargets = ChainLightning.maxTargets[magicLevel - 1];

    return game.players.getMyTeam(target.id)
      .filter(({ id }) => id !== target.id)
      .slice(0, maxTargets - 1);
  }

  /**
   * Основная функция запуска магии
   */
  run(initiator: Player, target: Player, game: GameService, index = 0): void {
    const multiplier = 1 - index * 0.1; // -10% каждой следующей цели
    const effectVal = this.effectVal({ initiator, target, game });
    const hit = floatNumber(effectVal * multiplier);

    target.stats.down('hp', hit);

    this.status.expArr.push({
      id: target.id,
      name: target.nick,
      val: hit,
      hp: target.stats.val('hp'),
    });
  }

  runAoe(initiator: Player, target: Player, game: GameService, index: number) {
    this.run(initiator, target, game, index);
  }

  next(): void {
    super.next();

    this.status.expArr = [];
  }
}

export default new ChainLightning();
