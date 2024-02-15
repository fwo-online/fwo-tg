import { floatNumber } from '../../utils/floatNumber';
import CastError from '../errors/CastError';
import type Game from '../GameService';
import type { Player } from '../PlayersService';
import { DmgMagic } from './DmgMagicConstructor';
import type { LongItem } from './LongMagicConstructor';
import type { BaseNext, DamageType, LongCustomMessage } from './types';

export type LongDmgMagicNext = BaseNext & {
  exp: number;
  dmg: number;
  actionType: 'dmg-magic-long';
  hp: number;
  dmgType: DamageType;
}

export interface LongDmgMagic extends DmgMagic, LongCustomMessage {
}
/**
 * Общий конструктор не длительных магий
 */
export abstract class LongDmgMagic extends DmgMagic {
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
    } catch (failMsg) {
      game.recordOrderResult(failMsg);
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
        this.getExp();
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
   * @param initiator  initiator
   * @param target  target
   * @param game  Game
   * buff = { frostTouch = [{initiator,target,duration},{}] }
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

  /**
   * Функция формирующая специальный формат вывода для длительной магии
   * @param initiator
   * @param target
   * @todo в старой арене формат длительной атакующей магии был :
   *
   */
  longNext(initiator: Player, target: Player): void {
    const { game } = this.params;
    const dmgObj: LongDmgMagicNext = {
      exp: this.status.exp,
      dmg: floatNumber(this.status.effect),
      action: this.displayName,
      actionType: 'dmg-magic-long',
      target: target.nick,
      initiator: initiator.nick,
      hp: target.stats.val('hp'),
      dmgType: this.dmgType,
      msg: this.longCustomMessage?.bind(this),
    };

    game.recordOrderResult(dmgObj);
  }
}
