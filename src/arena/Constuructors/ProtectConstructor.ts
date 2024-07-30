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
export abstract class ProtectConstructor extends AffectableAction {
  actionType: ActionType = 'protect';

  /**
   * Каст протекта
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры
   */
  cast(initiator: Player, target: Player, game: Game) {
    this.params = { initiator, target, game };
    try {
      this.checkPreAffects();
      this.run(initiator, target, game);
    } catch (e) {
      this.handleCastError(e);
    } finally {
      this.reset();
    }
  }

  abstract run(initiator: Player, target: Player, game: Game): void

  abstract getTargetProtectors(params: BaseActionParams): {
    initiator: string;
    val: number;
  }[]

  getProtectChance({ initiator, target } = this.params) {
    const attack = initiator.stats.val('atk') * initiator.proc;
    const protect = target.stats.val('def');
    const ratio = floatNumber(Math.round(attack / protect));

    return Math.round((1 - Math.exp(-0.33 * ratio)) * 100);
  }

  calculateExp(protect: number, hit: number) {
    return Math.round(hit * 0.4 * protect);
  }

  getExp(
    { initiator, target, game } = this.params,
    hit = 1,
  ) {
    const def = target.stats.val('def'); // общий показатель защиты цели

    const defenderFlags = this.getTargetProtectors({ initiator, target, game });

    defenderFlags.forEach((flag) => {
      const defender = game.players.getById(flag.initiator);
      if (!defender) {
        return;
      }

      const protect = Math.floor(flag.val * 100) / def;
      const exp = defender.isAlly(target) ? this.calculateExp(hit, protect) : 0;
      defender.stats.up('exp', exp);

      this.status.expArr.push({
        id: defender.id,
        name: defender.nick,
        exp,
      });
    });
  }

  preAffect: Affect['preAffect'] = (params, status) => {
    const { initiator, target, game } = params;
    const protectors = this.getTargetProtectors(params);
    if (!protectors.length) {
      return;
    }

    const chance = this.getProtectChance(params);

    if (chance < MiscService.rndm('1d100')) {
      this.getExp({ initiator, target, game }, status.effect);

      throw new CastError(this.getSuccessResult({ initiator, target, game }));
    }
  };
}
