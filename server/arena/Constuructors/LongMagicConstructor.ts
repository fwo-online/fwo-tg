import CastError from '../errors/CastError';
import type Game from '../GameService';
import type { Player } from '../PlayersService';
import { CommonMagic } from './CommonMagicConstructor';
import type { ActionType, LongCustomMessage, SuccessArgs } from './types';

export type LongItem = {
  initiator: string;
  target: string;
  duration: number;
  proc: number;
  round: number;
};

export interface LongMagic extends CommonMagic, LongCustomMessage {}

/**
 * Общий конструктор не длительных магий
 */
export abstract class LongMagic extends CommonMagic {
  actionType: ActionType = 'magic-long';
  isLong = true;
  buff: LongItem[] = [];

  /**
   * Добавляем в основной каст postRun для записи длительной магии в массив
   * @param initiator  initiator
   * @param target  target
   * @param game  Game
   */
  cast(initiator: Player, target: Player, game: Game): void {
    this.createContext(initiator, target, game);
    try {
      game.longActions[this.name] ??= [];
      this.buff = game.longActions[this.name] ?? [];
      this.getCost(initiator);
      this.checkPreAffects();
      this.checkChance();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.checkTargetIsDead();
      this.calculateExp();
      this.next();
      this.postRun(initiator, target, game);
    } catch (e) {
      this.handleCastError(e);
    } finally {
      this.reset();
    }
  }

  /**
   * Кастыль для обработки длительной магии
   * @param game объект игры
   * @todo hardcode =(
   */
  castLong(game: Game): void {
    // делаю просто перебор по массиву, контроль лежащей здесь магии должен
    // осуществлять Game, т.е при смерти кастера или таргета, нужно вычищать,
    // объект longActions и удалять касты связанные с трупами
    const longArray = game.longActions[this.name];
    if (!longArray) return;
    // [ { initiator: 2, target: 1, duration: 1, round: 0, proc: 1 } ]
    // выполняем обычный запуск магии
    longArray.forEach((item) => {
      if (game.round.count === item.round) return;
      try {
        item.duration -= 1;
        const initiator = game.players.getById(item.initiator);
        const target = game.players.getById(item.target);
        if (!initiator) {
          throw new CastError('NO_INITIATOR');
        }
        if (!target) {
          throw new CastError('NO_TARGET');
        }
        this.createContext(initiator, target, game);
        this.params.initiator.proc = item.proc;
        this.checkChance();
        this.runLong(initiator, target, game); // вызов кастомного обработчика
        this.calculateExp();
        this.checkTargetIsDead(); // проверка трупов в длительных магиях
        this.longNext({ initiator, target, game });
      } catch (e) {
        this.handleCastError(e);
      }
    });
    const filteredLongArray = longArray.filter((item) => item.duration !== 0);
    game.longActions[this.name] = filteredLongArray;
  }

  abstract runLong(initiator: Player, target: Player, game: Game): void;

  /**
   * Функция формирует объект параметров длительной магии внутри Game, для
   * текущего типа action
   * @param initiator Объект кастера
   * @param target Объект цели
   * @param game Объект игры
   * buff = { frostTouch = [{initiator,target,duration},{}] }
   * @todo нужно разрулить этот треш ибо оно работает ужасно
   */
  postRun(initiator: Player, target: Player, game: Game): void {
    game.longActions[this.name]?.push({
      initiator: this.params.initiator.id || initiator.id,
      target: this.params.target.id || target.id,
      duration:
        this.params.initiator.stats.val('spellLength') || initiator.stats.val('spellLength'),
      round: this.params.game.round.count || game.round.count,
      proc: this.params.initiator.proc || initiator.proc,
    });
  }

  /**
   * Вызов логгера для длительных магий
   * @param initiator
   * @param target
   * @todo использовать super.next()
   */
  longNext({ initiator, target, game } = this.params): void {
    const result: SuccessArgs = {
      ...super.getSuccessResult({ initiator, target, game }),
      actionType: 'magic-long',
    };

    this.giveExp(result);
    game.recordOrderResult(result);
  }
}

/**
 * [2,3,4 из 6] Эридан окутался <Сильной аурой> и
 * повысил свою защиту на 30.49pt. (e:+30/83)
 * [1 из 6] Эридан окутался <Аурой> и повысил свою
 * защиту на 1.63pt. (e:+2/84)
 * [4/7] ReaL заклинанием <Магическая стена> поднял
 *  защиту Mst на 329.57pt. (e:+33/638)
 */
