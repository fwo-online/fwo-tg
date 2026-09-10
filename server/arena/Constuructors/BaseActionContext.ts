import {
  type BaseAction,
  type BaseActionParams,
  BaseActionStatus,
} from '@/arena/Constuructors/BaseAction';
import type PlayerService from '@/arena/PlayersService/PlayerService';

export class BaseActionContext {
  params: BaseActionParams;
  status: BaseActionStatus;
  parentCtx?: BaseActionContext;
  private overridedTarget?: PlayerService;

  constructor(params: BaseActionParams, status: BaseActionStatus) {
    this.params = params;
    this.status = status;
  }

  get target() {
    return this.overridedTarget ?? this.params.target;
  }

  get initiator() {
    return this.params.initiator;
  }

  get game() {
    return this.params.game;
  }

  get rootCtx(): BaseActionContext {
    return this.parentCtx?.rootCtx ?? this;
  }

  overrideTarget(target: PlayerService) {
    this.overridedTarget = target;
  }

  addAffect(action: BaseAction, ctx = this) {
    const result = action.getSuccessResult(ctx);
    this.rootCtx.status.affects.push(result);

    return result;
  }

  reset() {
    this.status.reset();
  }

  clone() {
    return this.cloneWith(this.target);
  }

  cloneWith(target: PlayerService) {
    const clone = new BaseActionContext(
      {
        initiator: this.initiator,
        target,
        game: this.game,
      },
      new BaseActionStatus(),
    );

    clone.parentCtx = this;

    return clone;
  }
}
