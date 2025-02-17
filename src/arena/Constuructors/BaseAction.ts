import CastError from '@/arena/errors/CastError';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import { normalizeToArray } from '@/utils/array';
import { floatNumber } from '@/utils/floatNumber';
import type { ActionType, BreaksMessage, ExpArr, FailArgs, SuccessArgs } from './types';
import type { EffectType, FailMessage, OrderType, SuccessMessage } from '@fwo/schemas';

export type BaseActionParams = {
  initiator: Player;
  target: Player;
  game: GameService;
};

export type BaseActionStatus = {
  effect: number;
  exp: number;
  expArr: ExpArr;
};

export type BaseActionContext = {
  params: BaseActionParams;
  status: BaseActionStatus;
};

export abstract class BaseAction {
  name: string;
  displayName: string;
  orderType: OrderType;
  actionType: ActionType;
  effectType?: EffectType;
  lvl: number;

  context: BaseActionContext;
  params: BaseActionParams;

  status: BaseActionStatus = { effect: 0, exp: 0, expArr: [] };
  results: SuccessMessage;

  abstract cast(initiator: Player, target: Player, game: GameService);

  abstract run(initiator: Player, target: Player, game: GameService);

  createContext(initiator: Player, target: Player, game: GameService) {
    this.reset();
    this.params = { initiator, target, game };

    this.context = {
      params: this.params,
      status: this.status,
    };
  }

  applyContext(context: BaseActionContext) {
    this.status = context.status;
    this.params = context.params;

    this.context = context;
  }

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
      initiator: params.initiator,
      target: params.target,
      weapon: params.initiator.weapon.item,
    };
  }

  getSuccessResult({ initiator, target } = this.params): SuccessMessage {
    return {
      exp: this.status.exp,
      action: this.displayName,
      actionType: this.actionType,
      target: target.toObject(),
      initiator: initiator.toObject(),
      effect: floatNumber(this.status.effect),
      hp: target.stats.val('hp'),
      weapon: initiator.weapon.item?.info,
      effectType: this.effectType,
      orderType: this.orderType,
      expArr: this.status.expArr,
      // @ts-expect-error todo вынести кастомные сообщения в отдельный сервис
      msg: this.customMessage?.bind(this),
    };
  }

  giveExp(result: BreaksMessage | SuccessArgs | SuccessArgs[]) {
    if (typeof result === 'string') {
      return;
    }

    normalizeToArray(result).forEach((value) => {
      value.initiator.stats.up('exp', value.exp);

      value.expArr.forEach((arr) => {
        arr.initiator.stats.up('exp', arr.exp || 0);
      });
    });
  }

  handleCastError(error: unknown) {
    if (error instanceof CastError) {
      const result = this.getFailResult(error.reason);
      this.giveExp(result.reason);

      this.params.game.recordOrderResult(this.getFailResult(error.reason));
    } else {
      console.error(error);
    }
  }

  next({ initiator, target, game } = this.params): void {
    const result = this.getSuccessResult({ initiator, target, game });
    this.giveExp(result);

    game.recordOrderResult(result);
  }
}
