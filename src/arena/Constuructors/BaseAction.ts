import CastError from '@/arena/errors/CastError';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import { floatNumber } from '@/utils/floatNumber';
import type {
  ActionType, BreaksMessage, DamageType, ExpArr, FailArgs, OrderType, SuccessArgs,
} from './types';

export type BaseActionParams = {
  initiator: Player;
  target: Player;
  game: GameService
}

export type BaseActionStatus = {
  effect: number;
  exp: number;
  expArr: ExpArr
}

export abstract class BaseAction {
  name: string;
  displayName: string;
  orderType: OrderType;
  actionType: ActionType;
  effectType?: DamageType;

  params: BaseActionParams;

  status: BaseActionStatus = { effect: 0, exp: 0, expArr: [] };

  abstract cast(initiator: Player, target: Player, game: GameService)

  abstract run(initiator: Player, target: Player, game: GameService)

  reset() {
    this.status = { effect: 0, exp: 0, expArr: [] };
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

  getSuccessResult({ initiator, target } = this.params): SuccessArgs {
    return {
      exp: this.status.exp,
      action: this.displayName,
      actionType: this.actionType,
      target: target.nick,
      initiator: initiator.nick,
      effect: floatNumber(this.status.effect),
      hp: target.stats.val('hp'),
      weapon: initiator.weapon.item,
      effectType: this.effectType,
      orderType: this.orderType,
      expArr: this.status.expArr,
    };
  }

  handleCastError(error: unknown) {
    if (error instanceof CastError) {
      this.params.game.recordOrderResult(this.getFailResult(error.reason));
    } else {
      console.error(error);
    }
  }

  next({ initiator, target, game } = this.params): void {
    const result = this.getSuccessResult({ initiator, target, game });

    game.recordOrderResult(result);
  }
}
