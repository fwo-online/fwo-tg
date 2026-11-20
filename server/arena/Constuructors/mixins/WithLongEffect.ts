import type { BaseAction, BaseActionContext } from '@/arena/Constuructors/BaseAction';
import type { Affect } from '@/arena/Constuructors/interfaces/Affect';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import type Game from '@/arena/GameService';
import type { Player } from '@/arena/PlayersService';

export type AbstractConstructor<T = object> = abstract new (...args: any[]) => T;

export function WithLongEffect<TBase extends AbstractConstructor<BaseAction>>(Base: TBase) {
  abstract class LongEffectMixin extends Base {
    isLong = true;
    duration = 0;

    abstract override cast(initiator: Player, target: Player, game: Game, affect?: Affect): void;

    castLongEffect(initiator: Player, target: Player, game: Game, affect: Affect) {
      const clone = this.cloneAction();
      const oldProc = initiator.proc;

      try {
        initiator.proc = affect.proc ?? 1;
        if (affect.type === 'long-effect') {
          clone.duration = affect.duration;
        }
        clone.cast(initiator, target, game, affect);
      } finally {
        initiator.proc = oldProc;
      }
    }

    override getSuccessResult(ctx?: BaseActionContext): SuccessArgs {
      return {
        ...super.getSuccessResult(ctx),
        duration: this.duration,
      };
    }
  }

  return LongEffectMixin;
}
