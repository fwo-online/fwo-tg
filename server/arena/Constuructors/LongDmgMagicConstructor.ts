import type { BaseActionParams } from '@/arena/Constuructors/BaseAction';
import CastError from '../errors/CastError';
import type Game from '../GameService';
import type { Player } from '../PlayersService';
import { DmgMagic } from './DmgMagicConstructor';
import type { LongItem } from './LongMagicConstructor';
import type { ActionType, LongCustomMessage, SuccessArgs } from './types';

export interface LongDmgMagic extends DmgMagic, LongCustomMessage {}
/**
 * Общий конструктор не длительных магий
 */
export abstract class LongDmgMagic extends DmgMagic {
  actionType: ActionType = 'dmg-magic-long';
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
      this.handleAffect(this.checkChance.bind(this));
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.checkTargetIsDead();
      this.calculateExp();
      this.next();
      this.postRun(initiator, target, game);
    } catch (failMsg) {
      this.handleCastError(failMsg);
    } finally {
      this.reset();
    }
  }

  /**
   * Кастыль для обработки длительной магии
   * @param game объект игры
   * @todo hardcode =(
   * @todo возможно нужно вынести это в отдельный конструктор с которого будет
   * наследоваться вся логика "длительных" , сейча пока делаю так для mvp
   * @todo нужно выполнять groupBy по имени кастера, а затем "складывать"
   * урон и порядковые номера кастов и т.п
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
        this.longNext({ initiator, target, game }, item);
      } catch (e) {
        this.handleCastError(e);
      } finally {
        item.duration -= 1;
      }
    });
    const filteredLongArray = longArray.filter((item) => item.duration !== 0);
    game.longActions[this.name] = filteredLongArray;
  }

  abstract runLong(initiator: Player, target: Player, game: Game): void;

  /**
   * Функция формирует объект параметров длительной магии внутри Game, для
   * текущего типа action
   * @param initiator  initiator
   * @param target  target
   * @param game  Game
   * buff = { frostTouch = [{initiator,target,duration},{}] }
   */
  postRun(initiator: Player, target: Player, game: Game): void {
    game.longActions[this.name] ??= [];
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
   * Функция формирующая специальный формат вывода для длительной магии
   * * @todo использовать super.next()
   */
  longNext({ initiator, target, game }: BaseActionParams, longItem: LongItem): void {
    const result: SuccessArgs = {
      ...super.getSuccessResult({ initiator, target, game }),
      msg: this.longCustomMessage?.bind(this),
      duration: longItem.duration,
      actionType: 'dmg-magic-long',
    };

    this.giveExp(result);
    game.recordOrderResult(result);
  }
}
