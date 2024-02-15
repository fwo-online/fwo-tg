import CastError from '../errors/CastError';
import type Game from '../GameService';
import type { Player } from '../PlayersService';
import { CommonMagic } from './CommonMagicConstructor';
import type { MagicNext } from './MagicConstructor';
import type { ActionType, BaseNext, LongCustomMessage } from './types';

export type LongItem = {
  initiator: string;
  target: string;
  duration: number;
  proc: number;
  round: number;
}

export type LongMagicNext = BaseNext & {
  actionType: 'magic-long';
}

export interface LongMagic extends CommonMagic, LongCustomMessage {
}

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
    this.params = {
      initiator, target, game,
    };
    try {
      game.longActions[this.name] ??= [];
      this.buff = game.longActions[this.name] ?? [];
      this.getCost(initiator);
      this.checkPreAffects({ initiator, target, game });
      this.isBlurredMind(); // проверка не запудрило
      this.checkChance();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.checkTargetIsDead();
      this.getExp();
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
        this.params = { initiator, target, game };
        this.params.initiator.proc = item.proc;
        this.checkPreAffects({ initiator, target, game });
        this.isBlurredMind(); // проверка не запудрило
        this.checkChance();
        this.runLong(initiator, target, game); // вызов кастомного обработчика
        this.getExp({ initiator, target, game });
        this.checkTargetIsDead(); // проверка трупов в длительных магиях
        this.longNext(initiator, target);
      } catch (e) {
        game.recordOrderResult(e);
      }
    });
    const filteredLongArray = longArray.filter((item) => item.duration !== 0);
    game.longActions[this.name] = filteredLongArray;
  }

  abstract runLong(initiator: Player, target: Player, game: Game): void

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
      duration: this.params.initiator.stats.val('lspell')
          || initiator.stats.val('lspell'),
      round: this.params.game.round.count || game.round.count,
      proc: this.params.initiator.proc || initiator.proc,
    });
  }

  next(): void {
    const { initiator, target, game } = this.params;
    const args: MagicNext = {
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'magic',
      target: target.nick,
      initiator: initiator.nick,
      msg: this.customMessage?.bind(this),
    };
    game.recordOrderResult(args);
  }

  /**
   * Вызов логгера для длительных магий
   * @param initiator
   * @param target
   */
  longNext(initiator: Player, target: Player): void {
    const { game } = this.params;
    const args: LongMagicNext = {
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'magic-long',
      target: target.nick,
      initiator: initiator.nick,
      msg: this.longCustomMessage?.bind(this),
    };
    game.recordOrderResult(args);
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
