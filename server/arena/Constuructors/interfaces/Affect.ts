import type { ActionKey } from '@/arena/ActionService';
import type {
  BaseAction,
  BaseActionContext,
  BaseActionParams,
} from '@/arena/Constuructors/BaseAction';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import type { Player } from '@/arena/PlayersService';

type BaseAffect = {
  initiator: Player;
  action: ActionKey;
  value: number;
  proc?: number;

  onBeforeAction?: (
    ctx: BaseActionContext,
    action: BaseAction,
    affect: Affect,
  ) => void | SuccessArgs | SuccessArgs[];
  onBeforeReceive?: (
    ctx: BaseActionContext,
    action: BaseAction,
    affect: Affect,
  ) => void | SuccessArgs | SuccessArgs[];
  onCast?: (params: BaseActionParams, affect: Affect) => void;
  onDamageDealt?: (ctx: BaseActionContext, action: BaseAction, affect: Affect) => void;
  onDamageReceived?: (ctx: BaseActionContext, action: BaseAction, affect: Affect) => void;
  onHeal?: (ctx: BaseActionContext) => void;
  onCastFail?: (
    ctx: BaseActionContext,
    action: BaseAction,
    reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ) => void | SuccessArgs | SuccessArgs[];
};

export type Passive = BaseAffect & {
  type: 'passive';
};

export type Effect = BaseAffect & {
  type: 'effect';
  duration: number;
};

export type Affect = Passive | Effect;
