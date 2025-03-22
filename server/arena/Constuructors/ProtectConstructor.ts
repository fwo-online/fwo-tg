import type { ActionType } from '@/arena/Constuructors/types';
import type Game from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import type { Player } from '@/arena/PlayersService';
import { floatNumber } from '@/utils/floatNumber';
import CastError from '../errors/CastError';
import { AffectableAction } from './AffectableAction';
import type { BaseActionParams } from './BaseAction';
import type { Affect } from './interfaces/Affect';

/**
 * Класс защиты
 */
export abstract class ProtectConstructor extends AffectableAction implements Affect {
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
      this.checkPreAffects();
      this.run(initiator, target, game);
    } catch (e) {
      this.handleCastError(e);
    } finally {
      this.reset();
    }
  }

  abstract run(initiator: Player, target: Player, game: Game): void;

  abstract getTargetProtectors(params: BaseActionParams): {
    initiator: Player;
    val: number;
  }[];

  getProtectChance({ initiator, target } = this.params) {
    const attack = initiator.stats.val('phys.attack') * initiator.proc;
    const protect = target.stats.val('phys.defence');
    const ratio = floatNumber(Math.round(attack / protect));

    return Math.round((1 - Math.exp(-0.33 * ratio)) * 100);
  }

  calculateExp({ initiator, target, game } = this.params, hit = 1) {
    const defence = target.stats.val('phys.defence'); // общий показатель защиты цели
    const defenderFlags = this.getTargetProtectors({ initiator, target, game });

    defenderFlags.forEach(({ initiator: defender, val }) => {
      const protect = Math.floor(val * 100) / defence;
      const exp = defender.isAlly(target) && !defender.isAlly(initiator) ? Math.round(hit * 0.2 * protect) : 0;

      this.status.expArr.push({
        initiator: defender,
        target,
        exp,
      });
    });
  }

  preAffect: Affect['preAffect'] = ({ params, status }): undefined => {
    this.reset();

    const { initiator, target, game } = params;
    const protectors = this.getTargetProtectors(params);
    if (!protectors.length) {
      return;
    }

    const chance = this.getProtectChance(params);

    if (chance < MiscService.rndm('1d100')) {
      this.calculateExp({ initiator, target, game }, status.effect);

      throw new CastError(this.getSuccessResult({ initiator, target, game }));
    }
  };
}
