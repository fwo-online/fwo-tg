import type { ActionKey } from '@/arena/ActionService';
import type {
  BaseAction,
  BaseActionContext,
  BaseActionParams,
} from '@/arena/Constuructors/BaseAction';
import type { Player } from '@/arena/PlayersService';

type BaseAffect = {
  initiator: Player;
  action: ActionKey;
  value?: number;

  onBeforeRun?: (ctx: BaseActionContext, action: BaseAction) => void;
  onCast?: (params: BaseActionParams) => void;
  onDamageDealt?: (ctx: BaseActionContext, action: BaseAction) => void;
  onDamageReceived?: (ctx: BaseActionContext, action: BaseAction) => void;
  onAffectCalculation?: (ctx: BaseActionContext) => void;
  onHeal?: (ctx: BaseActionContext) => void;
};

export type Passive = BaseAffect & {
  type: 'passive';
};

export type Effect = BaseAffect & {
  type: 'effect';
  duration: number;
  proc: number;
};

export type Affect = Passive | Effect;
