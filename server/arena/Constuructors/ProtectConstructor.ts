import type { ActionType } from '@/arena/Constuructors/types';
import type Game from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import type { Player } from '@/arena/PlayersService';
import CastError from '../errors/CastError';
import { BaseAction, type BaseActionContext } from './BaseAction';

/**
 * Класс защиты
 */
export abstract class ProtectConstructor extends BaseAction {
  actionType: ActionType = 'protect';

  /**
   * Каст протекта
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры
   */
  cast(initiator: Player, target: Player, game: Game) {
    this.createContext(initiator, target, game);
    try {
      this.onBeforeRun();
      this.run(initiator, target, game);
    } catch (e) {
      this.handleCastError(e);
    } finally {
      this.reset();
    }
  }

  abstract run(initiator: Player, target: Player, game: Game): void;

  getTargetProtectors({ target } = this.params) {
    return target.affects.getEffectsByAction(this.name);
  }

  reduceProtection(ratio: number) {
    const effects = this.getTargetProtectors(this.params);

    effects.forEach((effect) => {
      effect.value ??= 0;
      effect.value *= ratio;
    });
  }

  getProtectChance({ initiator, target } = this.params, protect = 0) {
    const attack = initiator.stats.val('phys.attack') * initiator.proc;
    const ratio = attack / protect;

    const chance = Math.round(Math.exp(-0.33 * ratio) * 100);

    console.log(
      `protect chance:: ${chance}, ratio:: ${ratio}, attack:: ${attack}, protect:: ${protect}, initiator:: ${initiator.nick}, target:: ${target.nick}`,
    );
    return chance;
  }

  calculateExp({ initiator, target, game } = this.params, hit = 1) {
    const defence = target.stats.val('phys.defence'); // общий показатель защиты цели
    const effects = this.getTargetProtectors({ initiator, target, game });

    effects.forEach(({ initiator: defender, value = 0 }) => {
      const protect = Math.floor(value * 100) / defence;
      const exp =
        defender.isAlly(target) && !defender.isAlly(initiator)
          ? Math.round(hit * 0.2 * protect)
          : 0;

      this.status.expArr.push({
        initiator: defender,
        target,
        exp,
      });
    });
  }

  onBeforeReceive(ctx: BaseActionContext, action: BaseAction) {
    if (action.actionType !== 'phys') {
      return;
    }

    this.reset();
    const { initiator, target, game } = ctx.params;
    this.createContext(initiator, target, game);

    const protectors = this.getTargetProtectors(ctx.params);
    if (!protectors.length) {
      return;
    }

    const protect = protectors.reduce((acc, { value = 0 }) => acc + value, 0);
    const chance = this.getProtectChance(ctx.params, protect);

    const ratio = Math.min(chance / 100, 0.5);

    if (MiscService.chance(chance)) {
      this.calculateExp({ initiator, target, game }, ctx.status.effect);
      this.reduceProtection(ratio);

      throw new CastError(this.getSuccessResult({ initiator, target, game }));
    } else {
      this.reduceProtection(ratio);
    }
  }
}
