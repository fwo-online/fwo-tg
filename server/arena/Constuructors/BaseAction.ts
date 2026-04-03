import type { ActionType, EffectType, OrderType } from '@fwo/shared';
import type { ActionKey } from '@/arena/ActionService';
import CastError from '@/arena/errors/CastError';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import { normalizeToArray } from '@/utils/array';
import { floatNumber } from '@/utils/floatNumber';
import type { BreaksMessage, ExpArr, FailArgs, SuccessArgs } from './types';

export type BaseActionParams = {
  initiator: Player;
  target: Player;
  game: GameService;
};

export type BaseActionStatus = {
  effect: number;
  exp: number;
  expArr: ExpArr;
  affects: SuccessArgs[];
};

export type BaseActionContext = {
  params: BaseActionParams;
  status: BaseActionStatus;
};

export abstract class BaseAction {
  name!: ActionKey;
  displayName!: string;
  orderType!: OrderType;
  actionType!: ActionType;
  effectType?: EffectType;

  context!: BaseActionContext;
  params!: BaseActionParams;
  isAffect = false;

  status: BaseActionStatus = { effect: 0, exp: 0, expArr: [], affects: [] };

  abstract cast(initiator: Player, target: Player, game: GameService): void;

  abstract run(initiator: Player, target: Player, game: GameService): void;

  createContext(initiator: Player, target: Player, game: GameService) {
    this.reset();
    this.params = { initiator, target, game };

    this.context = {
      params: this.params,
      status: this.status,
    };
  }

  swapParams() {
    const { initiator, target, game } = this.params;
    this.params = { initiator: target, target: initiator, game };
  }

  reset() {
    this.status = { effect: 0, exp: 0, expArr: [], affects: [] };
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
    };
  }

  getSuccessResult({ initiator, target } = this.params): SuccessArgs {
    return {
      exp: this.status.exp,
      action: this.displayName,
      actionType: this.actionType,
      target,
      initiator,
      effect: floatNumber(this.status.effect),
      hp: target.stats.val('hp'),
      effectType: this.effectType,
      orderType: this.orderType,
      expArr: this.status.expArr,
      affects: this.status.affects,
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

    if (!this.isAffect) {
      game.recordOrderResult(result);
    }
  }

  onBeforeRun() {
    const { initiator, target } = this.context.params;

    initiator.affects.onBeforeAction(this.context, this);
    initiator.affects.withOnCastFail(
      () => target.affects.onBeforeReceive(this.context, this),
      this.context,
      this,
    );
  }
}
