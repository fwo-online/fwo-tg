import CastError from '@/arena/errors/CastError';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import type {
  ActionType, BreaksMessage, FailArgs, OrderType, SuccessArgs,
} from './types';

export type BaseActionParams = {
  initiator: Player;
  target: Player;
  game: GameService
}

export type BaseActionStatus = {
  effect: number;
  exp: number;
}

export abstract class BaseAction {
  name: string;
  displayName: string;
  orderType: OrderType;
  actionType: ActionType;

  params: BaseActionParams;

  status: BaseActionStatus = { effect: 0, exp: 0 };

  abstract cast(initiator: Player, target: Player, game: GameService)

  abstract run(initiator: Player, target: Player, game: GameService)

  reset() {
    this.status = { effect: 0, exp: 0 };
  }

  getFailResult(
    reason: BreaksMessage | SuccessArgs | SuccessArgs[],
    params = this.params,
  ): FailArgs {
    return {
      actionType: this.actionType,
      reason,
      action: this.displayName,
      initiator: params.initiator.nick,
      target: params.target.nick,
      weapon: params.initiator.weapon.item,
    };
  }

  handleCastError(error: unknown) {
    if (error instanceof CastError) {
      this.params.game.recordOrderResult(this.getFailResult(error.reason));
    } else {
      console.error(error);
    }
  }
}
