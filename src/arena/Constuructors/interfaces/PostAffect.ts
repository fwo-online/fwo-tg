import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import type { SuccessArgs } from '../types';

export interface PostAffect {
  postAffect(
    params: { initiator: Player, target: Player, game: GameService},
    status: { effect: number, exp: number; }
  ): SuccessArgs | SuccessArgs[] | void
}
