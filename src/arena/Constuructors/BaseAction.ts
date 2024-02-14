import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

export abstract class BaseAction {
  params: {
    initiator: Player;
    target: Player;
    game: GameService
  };

  status = { effect: 0, exp: 0 };

  abstract cast(initiator: Player, target: Player, game: GameService)

  /**
   * @param initiator объект персонажа
   * @param target объект персонажа
   * @param game Объект игры для доступа ко всему
   */
  abstract run(initiator: Player, target: Player, game: GameService)

  reset() {
    this.status = { effect: 0, exp: 0 };
  }
}
