import { OrderType } from '@fwo/shared';
import { LongMagic } from '@/arena/Constuructors/LongMagicConstructor';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import { bold, italic } from '@/utils/formatString';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';

/** Fixed two-round stat debuff, shared by all sources of concussion. */
class Concussion extends LongMagic {
  isAffect = true;
  duration = 2;

  constructor() {
    super({
      name: 'concussion',
      displayName: 'Контузия',
      desc: 'Снижает физическую и магическую атаку цели на 2 раунда, включая текущий',
      cost: 0,
      costType: 'mp',
      baseExp: 0,
      lvl: 0,
      orderType: OrderType.Enemy,
      aoeType: 'target',
      magType: 'bad',
      chance: [100],
      effect: [],
      profList: [],
    });
  }

  /** Explicit power only: no magic chance, resource cost, proc or magic rank scaling. */
  cast(initiator: Player, target: Player, game: GameService, affect?: Affect) {
    this.createContext(initiator, target, game);
    this.status.effect = affect?.value ?? 0;
    this.run();
    game.recordOrderResult(this.getSuccessResult());
  }

  run() {
    const { target } = this.context;
    const multiplier = 1 - this.status.effect / 100;
    target.stats.mul('phys.attack', multiplier);
    target.stats.mul('magic.attack', multiplier);
  }

  customMessage(args: SuccessArgs): string {
    return `${italic(concussion.displayName)}: ${bold(args.target.nick)}`;
  }
}

export const concussion = new Concussion();
