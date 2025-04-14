import _ from 'lodash';
import { LongMagic } from '../Constuructors/LongMagicConstructor';
import { isPhysicalDamageResult, findByTarget } from '../Constuructors/utils';
import type GameService from '../GameService';
import type { Player } from '../PlayersService';

const minProtect = 5;
const maxProtect = 20;

class DustShield extends LongMagic {
  constructor() {
    super({
      name: 'dustShield',
      displayName: 'Щит праха',
      desc: 'Щит из праха повышает защиту кастера на величину, результат деления количества повреждений предыдущего раунда на количество атакеров, но не больше 20 и не меньше 5.',
      cost: 14,
      baseExp: 2,
      costType: 'mp',
      lvl: 4,
      orderType: 'self',
      aoeType: 'target',
      magType: 'good',
      chance: [90, 96, 98],
      profList: ['m'],
      effect: ['1d3', '1d5', '1d7'],
    });
  }

  run(initiator: Player, target: Player, game: GameService): void {
    const protect = this.calculateProtect(initiator, target, game);

    target.stats.up('phys.defence', _.clamp(protect, minProtect, maxProtect));
  }

  runLong(initiator: Player, target: Player, game: GameService): void {
    this.run(initiator, target, game);
  }

  getEffectExp(effect: number, baseExp = 0): number {
    return Math.round(baseExp * effect);
  }

  calculateProtect(initiator: Player, target: Player, game: GameService) {
    const effect = this.effectVal({ initiator, target, game });

    const results = game.getLastRoundResults();
    const physicalDamageResults = results
      .filter(isPhysicalDamageResult)
      .filter(findByTarget(target.nick));

    const damageTaken = physicalDamageResults.reduce((sum, { effect }) => sum + effect, 0);
    if (damageTaken) {
      return effect + (damageTaken / physicalDamageResults.length) || 0;
    }

    return effect;
  }
}

export default new DustShield();
