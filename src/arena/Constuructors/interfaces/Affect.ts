import type { SuccessArgs } from '@/arena/Constuructors/types';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

type AffectResult = SuccessArgs | SuccessArgs[] | void;

export type AffectFn = (
  params: { initiator: Player, target: Player, game: GameService },
  status: { effect: number, exp: number; }
) => AffectResult

export interface Affect {
  preAffect?: AffectFn;
  postAffect?: AffectFn;

  affectHandler?(
    params: { initiator: Player, target: Player, game: GameService },
    affect: SuccessArgs | SuccessArgs[]
  ): AffectResult;
}
