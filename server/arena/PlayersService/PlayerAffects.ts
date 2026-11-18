import type { ActionKey } from '@/arena/ActionService';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect, Effect, LongEffect, Passive } from '@/arena/Constuructors/interfaces/Affect';
import type { BreaksMessage, SuccessArgs } from '@/arena/Constuructors/types';
import { isCastError } from '@/arena/errors/CastError';
import type GameService from '@/arena/GameService';
import { getStageRank } from '@/arena/stages';

export class PlayerAffects {
  #affects: Affect[] = [];

  get affects(): ReadonlyArray<Affect> {
    return this.#affects.toSorted((a, b) => getStageRank(a.action) - getStageRank(b.action));
  }

  has(affect: Affect) {
    return this.#affects.includes(affect);
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
    return this.affects.filter((effect) => effect.action === action);
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

  private *iterateAffects(getAffects: () => PlayerAffects = () => this) {
    const processed = new Set<Affect>();

    while (true) {
      const affects = getAffects();

      for (const affect of affects.affects) {
        if (processed.has(affect) || !affects.has(affect)) {
          continue;
        }

        processed.add(affect);
        yield affect;

        if (getAffects() !== affects) {
          break;
        }
      }

      if (getAffects() === affects) {
        return;
      }
    }
  }

  onBeforeDamageDeal(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.iterateAffects()) {
      affect.onBeforeDamageDeal?.(ctx, action, affect);
    }
  }

  onBeforeDamageRecieve(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.iterateAffects(() => ctx.target.affects)) {
      affect.onBeforeDamageRecieve?.(ctx, action, affect);
    }
  }

  onDamageReceived(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.iterateAffects()) {
      affect.onDamageReceived?.(ctx, action, affect);
    }
  }

  onDamageDealt(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.iterateAffects()) {
      affect.onDamageDealt?.(ctx, action, affect);
    }
  }

  onBeforeAction(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.iterateAffects()) {
      this.withOnCastFail(() => affect.onBeforeAction?.(ctx, action, affect), ctx, action);
    }
  }

  onBeforeHealDeal(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.iterateAffects()) {
      affect.onBeforeHealDeal?.(ctx, action, affect);
    }
  }

  onCast(game: GameService, action: ActionKey) {
    for (const affect of this.iterateAffects()) {
      if (action === affect.action) {
        affect.onCast?.(game, affect);
      }
    }
  }

  onCastFail(
    ctx: BaseActionContext,
    action: BaseAction,
    reason: SuccessArgs | SuccessArgs[] | BreaksMessage,
  ) {
    for (const affect of this.iterateAffects()) {
      const result = affect.onCastFail?.(ctx, action, reason);
      if (result) {
        return true;
      }
    }

    return false;
  }

  onAfterCast(ctx: BaseActionContext, action: BaseAction) {
    for (const affect of this.iterateAffects()) {
      affect.onAfterCast?.(ctx, action, affect);
    }
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
