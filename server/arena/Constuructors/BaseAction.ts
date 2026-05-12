import type { ActionType, EffectType, OrderType } from '@fwo/shared';
import type { ActionKey } from '@/arena/ActionService';
import { BaseActionContext } from '@/arena/Constuructors/BaseActionContext';
import CastError from '@/arena/errors/CastError';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';
import { normalizeToArray } from '@/utils/array';
import { floatNumber } from '@/utils/floatNumber';
import type { BreaksMessage, ExpArr, FailArgs, SuccessArgs } from './types';

export type { BaseActionContext } from '@/arena/Constuructors/BaseActionContext';

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

export abstract class BaseAction {
  name!: ActionKey;
  displayName!: string;
  orderType!: OrderType;
  actionType!: ActionType;
  effectType?: EffectType;

  context!: BaseActionContext = {};
  isAffect = false;

  abstract cast(initiator: Player, target: Player, game: GameService): void;

  abstract run(initiator: Player, target: Player, game: GameService): void;

  createContext(initiator: Player, target: Player, game: GameService) {
    this.context = new BaseActionContext({ initiator, target, game });
    return this.context;
  }

  get params() {
    return this.context.params;
  }

  get status() {
    return this.context.status;
  }

  reset() {
    this.context.reset?.();
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

  getSuccessResult({ initiator, target, status } = this.context): SuccessArgs {
    return {
      exp: status.exp,
      action: this.displayName,
      actionType: this.actionType,
      target,
      initiator,
      effect: floatNumber(status.effect),
      hp: target.stats.val('hp'),
      effectType: this.effectType,
      orderType: this.orderType,
      expArr: status.expArr,
      affects: status.affects,
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

  next(context = this.context): void {
    const result = this.getSuccessResult(context);
    this.giveExp(result);

    if (!this.isAffect) {
      context.game.recordOrderResult(result);
    }
  }

  onBeforeRun() {
    const { initiator } = this.context.params;

    initiator.affects.onBeforeAction(this.context, this);
  }
}
