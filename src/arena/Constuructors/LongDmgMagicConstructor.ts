import { floatNumber } from '../../utils/floatNumber';
import type { SuccessArgs } from '../BattleLog';
import type Game from '../GameService';
import type Player from '../PlayerService';
import { DmgMagic } from './DmgMagicConstructor';
import type { LongItem } from './LongMagicConstructor';
import type { LongCustomMessage } from './types';

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
      this.buff = game.longActions[this.name];
      this.getCost(initiator);
      this.checkPreAffects(initiator, target, game);
      this.isblurredMind(); // проверка не запудрило
      this.checkChance();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.checkTargetIsDead();
      this.getExp();
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
   * @todo возможно нужно вынести это в отдельный конструктор с которого будет
   * наследоваться вся логика "длительных" , сейча пока делаю так для mvp
   * @todo нужно выполнять groupBy по имени кастера, а затем "складывать"
   * урон и порядковые номера кастов и т.п
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
        this.getExp();
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
   * @param initiator  initiator
   * @param target  target
   * @param game  Game
   * buff = { frostTouch = [{initiator,target,duration},{}] }
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

  /**
   * Функция формирующая специальный формат вывода для длительной магии
   * @param initiator
   * @param target
   * @todo в старой арене формат длительной атакующей магии был :
   *
   */
  longNext(initiator: Player, target: Player): void {
    const { game } = this.params;
    const dmgObj: SuccessArgs = {
      exp: this.status.exp,
      dmg: floatNumber(this.status.hit),
      action: this.displayName,
      actionType: 'magic',
      target: target.nick,
      initiator: initiator.nick,
      hp: target.stats.val('hp'),
      dmgType: this.dmgType,
      msg: this.longCustomMessage?.bind(this),
    };
    game.addHistoryDamage(dmgObj);
    game.battleLog.success(dmgObj);
  }
}
