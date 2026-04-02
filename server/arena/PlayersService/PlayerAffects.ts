import type { ActionKey } from '@/arena/ActionService';
import type {
  BaseAction,
  BaseActionContext,
  BaseActionParams,
} from '@/arena/Constuructors/BaseAction';
import type { Affect, Effect, Passive } from '@/arena/Constuructors/interfaces/Affect';

export class PlayerAffects {
  #affects: Affect[] = [];

  get affects(): ReadonlyArray<Affect> {
    return this.#affects;
  }

  addEffect(effect: Omit<Effect, 'type'>) {
    this.#affects.push({ ...effect, type: 'effect' });
  }

  addPassive(passive: Omit<Passive, 'type'>) {
    this.#affects.push({ ...passive, type: 'passive' });
  }

  removeEffectsByAction(action: ActionKey) {
    this.#affects = this.#affects.filter((effect) => effect.action !== action);
  }

  getEffectsByAction(action: ActionKey): Affect[] {
    return this.#affects.filter((effect) => effect.action === action);
  }

  refresh() {
    this.#affects.forEach((affect) => {
      if (affect.type === 'effect') {
        affect.duration--;
      }
    });

    this.#affects = this.#affects.filter((affect) => {
      if (affect.type === 'effect') {
        return affect.duration > 0;
      }

      return true;
    });
  }

  onDamageReceived(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.#affects) {
      affect.onDamageReceived?.(ctx, action, affect);
    }
  }

  onBeforeRun(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.#affects) {
      affect.onBeforeRun?.(ctx, action, affect);
    }
  }

  onCast(params: BaseActionParams, action: ActionKey) {
    for (const affect of this.#affects) {
      if (action === affect.action) {
        affect.onCast?.(params, affect);
      }
    }
  }
}
