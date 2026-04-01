import type { ActionKey } from '@/arena/ActionService';
import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { EffectInterface } from '@/arena/Constuructors/EffectConstuctor';

export class PlayerEffects {
  #effects: EffectInterface[] = [];

  get effects(): ReadonlyArray<EffectInterface> {
    return this.#effects;
  }

  addEffect(effect: EffectInterface) {
    this.#effects.push(effect);
  }

  removeEffectsByAction(action: ActionKey) {
    this.#effects = this.#effects.filter((effect) => effect.action !== action);
  }

  getEffectsByAction(action: ActionKey): EffectInterface[] {
    return this.#effects.filter((effect) => effect.action === action);
  }

  refresh() {
    this.#effects.forEach((effect, index) => {
      effect.duration--;

      if (effect.duration <= 0) {
        this.#effects.splice(index, 1);
      }
    });
  }

  onDamageReceived(ctx: BaseActionContext, action: BaseAction) {
    for (const effect of this.#effects) {
      effect.onDamageReceived?.(ctx, action);
    }
  }

  onBeforeRun(ctx: BaseActionContext, action: BaseAction) {
    for (const effect of this.#effects) {
      effect.onBeforeRun?.(ctx, action);
    }
  }
}
