import type Game from '../GameService';
import type Player from '../PlayerService';
import { CommonMagic } from './CommonMagicConstructor';
import type { LongCustomMessage } from './types';

export type LongItem = {
  initiator: string;
  target: string;
  duration: number;
  proc: number;
  round: number;
}

export interface LongMagic extends CommonMagic, LongCustomMessage {
}

/**
 * Общий конструктор не длительных магий
 */
export abstract class LongMagic extends CommonMagic {
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
      this.buff = game.longActions[this.name];
      this.getCost(initiator);
      this.checkPreAffects(initiator, target, game);
      this.isblurredMind(); // проверка не запудрило
      this.checkChance();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.checkTargetIsDead();
      this.getExp(initiator);
      this.next();
      this.postRun(initiator, target, game);
    } catch (failMsg) {
      const { battleLog } = this.params.game;
      battleLog.log(failMsg);
    }
  }

  /**
   * Кастыль для обработки длительной магии
   * @param game обьект игры
   * @todo hardcode =(
   */
  castLong(game: Game): void {
    // делаю просто перебор по массиву, контроль лежащей здесь магии должен
    // осуществлять Game, т.е при смерти кастера или таргета, нужно вычищать,
    // обьект longActions и удалять касты связанные с трупами
    if (!game.longActions[this.name]) return;
    // [ { initiator: 2, target: 1, duration: 1, round: 0, proc: 1 } ]
    // выполняем обычный запуск магии
    const longArray = game.longActions[this.name];
    longArray.forEach((item) => {
      if (game.round.count === item.round) return;
      try {
        item.duration -= 1;
        const initiator = game.getPlayerById(item.initiator);
        const target = game.getPlayerById(item.target);
        this.params = { initiator, target, game };
        this.params.initiator.proc = item.proc;
        this.checkPreAffects(initiator, target, game);
        this.isblurredMind(); // проверка не запудрило
        this.checkChance();
        this.runLong(initiator, target, game); // вызов кастомного обработчика
        this.getExp(initiator);
        this.checkTargetIsDead(); // проверка трупов в длительных магиях
        this.longNext(initiator, target);
      } catch (e) {
        game.battleLog.log(e);
      }
    });
    const filteredLongArray = longArray.filter((item) => item.duration !== 0);
    game.longActions[this.name] = filteredLongArray;
  }

  abstract runLong(initiator: Player, target: Player, game: Game): void

  /**
   * Функция формирует обьект параметров длительной магии внутри Game, для
   * текущего типа action
   * @param initiator Обьект кастера
   * @param target Обьект цели
   * @param game Обьект игры
   * buff = { frostTouch = [{initiator,target,duration},{}] }
   * @todo нужно разрулить этот треш ибо оно работает ужасно
   */
  postRun(initiator: Player, target: Player, game: Game): void {
    game.longActions[this.name].push({
      initiator: this.params.initiator.id || initiator.id,
      target: this.params.target.id || target.id,
      duration: this.params.initiator.stats.val('lspell')
          || initiator.stats.val('lspell'),
      round: this.params.game.round.count || game.round.count,
      proc: this.params.initiator.proc || initiator.proc,
    });
  }

  next(): void {
    const { battleLog } = this.params.game;
    battleLog.success({
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'magic',
      target: this.params.target.nick,
      initiator: this.params.initiator.nick,
      msg: this.customMessage?.bind(this),
    });
  }

  /**
   * Вызов логгера для длительных магий
   * @param initiator
   * @param target
   */
  longNext(initiator: Player, target: Player): void {
    const { battleLog } = this.params.game;
    battleLog.success({
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'magic',
      target: target.nick,
      initiator: initiator.nick,
      msg: this.longCustomMessage?.bind(this),
    });
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
