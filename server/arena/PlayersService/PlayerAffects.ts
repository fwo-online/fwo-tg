import type { ActionKey } from '@/arena/ActionService';
import type {
  BaseAction,
  BaseActionContext,
  BaseActionParams,
} from '@/arena/Constuructors/BaseAction';
import type { Affect, Effect, LongEffect, Passive } from '@/arena/Constuructors/interfaces/Affect';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import { isCastError } from '@/arena/errors/CastError';

export class PlayerAffects {
  #affects: Affect[] = [];

  get affects(): ReadonlyArray<Affect> {
    return this.#affects;
  }

  addEffect<T extends Omit<Effect, 'type'>>(effect: T) {
    this.#affects.push({ ...effect, type: 'effect' });
  }

  addLongEffect<T extends Omit<LongEffect, 'type'>>(effect: T) {
    this.#affects.push({ ...effect, type: 'long-effect' });
  }

  addPassive<T extends Omit<Passive, 'type'>>(passive: T) {
    this.#affects.push({ ...passive, type: 'passive' });
  }

  removeEffectsByAction(action: ActionKey) {
    this.#affects = this.#affects.filter((effect) => effect.action !== action);
  }

  filterAffects(predicate: (affect: Affect) => boolean) {
    this.#affects = this.#affects.filter(predicate);
  }

  getEffectsByAction<T extends ActionKey>(action: T) {
    return this.#affects.filter((effect) => effect.action === action);
  }

  refresh() {
    this.#affects.forEach((affect) => {
      if (affect.type === 'long-effect') {
        affect.duration--;
      }
    });

    this.#affects = this.#affects.filter((affect) => {
      if (affect.type === 'long-effect') {
        return affect.duration > 0;
      }

      if (affect.type === 'effect') {
        return false;
      }

      return true;
    });
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.#affects) {
      affect.onBeforeDamageDeal?.(ctx, action, affect);
    }
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.#affects) {
      affect.onBeforeDamageRecieve?.(ctx, action, affect);
    }
  }

  onDamageReceived(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.#affects) {
      affect.onDamageReceived?.(ctx, action, affect);
    }
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.#affects) {
      affect.onDamageDealt?.(ctx, action, affect);
    }
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.#affects) {
      this.withOnCastFail(() => affect.onBeforeAction?.(ctx, action, affect), ctx, action);
    }
  }

  onCast(params: BaseActionParams, action: ActionKey) {
    for (const affect of this.#affects) {
      if (action === affect.action) {
        affect.onCast?.(params, affect);
      }
    }
  }

  onCastFail(
    ctx: BaseActionContext,
    action: BaseAction,
    reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ) {
    for (const affect of this.#affects) {
      const result = affect.onCastFail?.(ctx, action, reason);
      if (result) {
        return true;
      }
    }

    return false;
  }

  withOnCastFail(fn: () => void, ctx: BaseActionContext, action: BaseAction) {
    try {
      fn();
    } catch (e) {
      if (isCastError(e) && this.onCastFail(ctx, action, e.reason)) {
        return;
      }

      throw e;
    }
  }
}
