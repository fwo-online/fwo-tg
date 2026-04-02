import type { ActionType } from '@fwo/shared';
import type { BaseActionParams } from '@/arena/Constuructors/BaseAction';
import type { SuccessArgs } from '@/arena/Constuructors/types';
import type Game from '../GameService';
import type { Player } from '../PlayersService';
import { CommonMagic } from './CommonMagicConstructor';

export type LongItem = {
  initiator: string;
  target: string;
  duration: number;
  proc: number;
  round: number;
};

export interface LongMagic extends CommonMagic {}

/**
 * Общий конструктор не длительных магий
 */
export abstract class LongMagic extends CommonMagic {
  actionType: ActionType = 'magic-long';
  isLong = true;
  duration = 0;

  /**
   * Добавляем в основной каст postRun для записи длительной магии в массив
   * @param initiator  initiator
   * @param target  target
   * @param game  Game
   */
  cast(initiator: Player, target: Player, game: Game): void {
    try {
      this.createContext(initiator, target, game);

      this.checkChance();
      initiator.affects.onBeforeRun(this.context, this);
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.calculateExp();
      this.checkTargetIsDead(); // проверка трупов в длительных магиях
      this.next({ initiator, target, game });
    } catch (e) {
      if (this.isAffect) {
        throw e;
      }

      this.handleCastError(e);
    } finally {
      this.reset();
    }
  }

  override getSuccessResult(params?: BaseActionParams): SuccessArgs {
    return {
      ...super.getSuccessResult(params),
      duration: this.duration,
    };
  }
  /**
   * Для длителных бафов exp считаем по BaseExp*effect
   */
  getEffectExp(effect: number, baseExp = 0) {
    return Math.round((baseExp * this.params.initiator.proc * effect) / 4);
  }
}

/**
 * [ибо 2,3,4 из 6] Эридан окутался <Сильной аурой> и
 * повысил свою защиту на 30.49pt. (e:+30/83)
 * [1 из 6] Эридан окутался <Аурой> и повысил свою
 * защиту на 1.63pt. (e:+2/84)
 * [4/7] ReaL заклинанием <Магическая стена> поднял
 *  защиту Mst на 329.57pt. (e:+33/638)
 */
