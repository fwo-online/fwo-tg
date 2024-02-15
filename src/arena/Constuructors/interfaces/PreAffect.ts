import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

export interface PreAffect {
  preAffect(
    params: { initiator: Player, target: Player, game: GameService},
    status: { effect: number }
  ): void
}
