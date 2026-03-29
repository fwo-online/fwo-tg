import type GameService from '@/arena/GameService';
import type { MonsterService } from '@/arena/MonsterService/MonsterService';
import type PlayerService from '@/arena/PlayersService/PlayerService';

export abstract class MonsterAI {
  monster: MonsterService;
  constructor(monster: MonsterService) {
    this.monster = monster;
  }

  abstract makeOrder(game: GameService): void;

  protected orderAttack(
    game: GameService,
    target: PlayerService,
    proc = this.monster.proc,
  ): boolean {
    try {
      game.orders.orderAction({
        action: 'attack',
        initiator: this.monster.id,
        target: target.id,
        proc,
      });
      return true;
    } catch {
      return false;
    }
  }
}
