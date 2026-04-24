import type {
  BaseAction,
  BaseActionParams,
  BaseActionStatus,
} from '@/arena/Constuructors/BaseAction';
import type PlayerService from '@/arena/PlayersService/PlayerService';

export class BaseActionContext {
  params: BaseActionParams;
  status: BaseActionStatus;
  parentCtx?: BaseActionContext;
  private overridedTarget?: PlayerService;

  constructor(params: BaseActionParams) {
    this.params = params;
    this.status = { effect: 0, exp: 0, expArr: [], affects: [] };
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
    this.params.target = target;
  }

  addAffect(action: BaseAction, params = this.params) {
    const result = action.getSuccessResult(params);
    this.rootCtx.status.affects.push(result);

    return result;
  }

  reset() {
    this.status = { effect: 0, exp: 0, expArr: [], affects: [] };
  }

  cloneWith(target: PlayerService) {
    const clone = new BaseActionContext({
      initiator: this.initiator,
      target,
      game: this.game,
    });

    clone.parentCtx = this;

    return clone;
  }
}
