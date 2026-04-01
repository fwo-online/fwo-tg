import type { ActionKey } from '@/arena/ActionService';
import type {
  BaseAction,
  BaseActionContext,
  BaseActionStatus,
} from '@/arena/Constuructors/BaseAction';
import type { Player } from '@/arena/PlayersService';

export type EffectStatus = BaseActionStatus & {
  duration: number;
};

export interface EffectInterface {
  initiator: Player;
  action: ActionKey;
  duration: number;
  proc: number;
  value?: number;

  onBeforeRun?: (ctx: BaseActionContext, action: BaseAction) => void;
  onCast?: (ctx: BaseActionContext) => void;
  onDamageDealt?: (ctx: BaseActionContext, action: BaseAction) => void;
  onDamageReceived?: (ctx: BaseActionContext, action: BaseAction) => void;
  onEffectCalculation?: (ctx: BaseActionContext) => void;
  onHeal?: (ctx: BaseActionContext) => void;
}
