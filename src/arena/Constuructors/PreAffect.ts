import type GameService from '../GameService';
import type { Player } from '../PlayersService';
import type { SuccessArgs } from './types';

export interface PreAffect {
  check(params: { initiator: Player, target: Player, game: GameService}): SuccessArgs | void
}
