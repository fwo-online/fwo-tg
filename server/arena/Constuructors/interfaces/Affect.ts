import type { ActionKey } from '@/arena/ActionService';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import type GameService from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

type BaseAffectHook = (ctx: BaseActionContext, action: BaseAction, affect: Affect) => void;
type BaseAffectHookWithResult = (
  ctx: BaseActionContext,
  action: BaseAction,
  affect: Affect,
) => void | SuccessArgs | SuccessArgs[];

type BaseAffect = {
  initiator: Player;
  action: ActionKey;
  value?: number;
  proc?: number;

  onBeforeAction?: BaseAffectHookWithResult;
  onBeforeReceive?: BaseAffectHookWithResult;
  onCast?: (game: GameService, affect: Affect) => void;
  onBeforeDamageDeal?: BaseAffectHook;
  onBeforeDamageRecieve?: BaseAffectHook;
  onDamageDealt?: BaseAffectHook;
  onDamageReceived?: BaseAffectHook;
  onBeforeHealDeal?: BaseAffectHook;
  onCastFail?: (
    ctx: BaseActionContext,
    action: BaseAction,
    reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ) => void | SuccessArgs | SuccessArgs[] | boolean;
  onAfterCast?: BaseAffectHook;
};

export type Passive = BaseAffect & {
  type: 'passive';
};

export type Effect = BaseAffect & {
  type: 'effect';
};

export type LongEffect = BaseAffect & {
  type: 'long-effect';
  duration: number;
};

export type Affect = Passive | Effect | LongEffect;
