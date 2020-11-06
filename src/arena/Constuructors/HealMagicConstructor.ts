import { floatNumber } from '../../utils/floatNumber';
import type Game from '../GameService';
import MiscService from '../MiscService';
import type Player from '../PlayerService';
import type { BaseNext, CustomMessage, OrderType } from './types';

/**
 * @typedef {import ('../PlayerService').default} player
 * @typedef {import ('../GameService').default} game
 */

export type HealNext = BaseNext & {
  actionType: 'heal';
  effect: number;
}

export interface HealArgs {
  name: string;
  displayName: string;
  desc: string;
  lvl: number;
  orderType: OrderType;
}

export interface Heal extends HealArgs, CustomMessage {
}
/**
 * Heal Class
 */
export abstract class Heal {
  params!: {
    initiator: Player;
    target: Player;
    game: Game;
  };
  status = {
    exp: 0,
    val: 0,
  }

  constructor(params: HealArgs) {
    Object.assign(this, params);
  }

  /**
   * Основная функция выполнения. Из неё дёргаются все зависимости
   * Общий метод каста магии
   * в нём выполняются общие функции для всех магий
   * @param {player} initiator Обьект кастера
   * @param {player} target Обьект цели
   * @param {game} game Обьект игры (не обязателен)
   */
  cast(initiator: Player, target: Player, game: Game): void {
    this.params = {
      initiator, target, game,
    };

    try {
      this.run(initiator, target, game);
      // Получение экспы за хил следует вынести в отдельный action следующий
      // за самим хилом, дабы выдать exp всем хиллерам после формирования
      // общего массива хила
      //     this.getExp(initiator, target, game);
      // this.backToLife();
      this.next();
    } catch (e) {
      this.breaks(e);
    }
  }

  abstract run(initiator: Player, target: Player, game: Game): void;

  /**
   * Функция выполняет проверку, является ли хил "воскресившим", т.е если
   * цель до выпонения личения имела статус "isDead", а после хила имее хп > 0
   * Значит накидываем хилеру 1 голды :)
   */
  // eslint-disable-next-line class-methods-use-this
  // backToLife() {}

  /**
   * @param {Object} obj
   */
  breaks(obj: any): void {
    const { target, initiator } = this.params;
    const msg = {
      message: obj.message,
      target: target.nick,
      initiator: initiator.nick,
    };
    const { battleLog } = this.params.game;
    battleLog.log(msg);
  }

  /**
   * Функция вычисления размера хила
   * @return размер хила
   */
  effectVal(): number {
    const i = this.params.initiator;
    const proc = i.proc || 0;
    const eff = MiscService.randInt(i.stats.val('hl').min,
      i.stats.val('hl').max);
    return floatNumber(eff * proc);
  }

  /**
   * Функция положительного прохождения
   */
  next(): void {
    const { target, initiator } = this.params;
    const { battleLog } = this.params.game;
    const args: HealNext = {
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'heal',
      target: target.nick,
      initiator: initiator.nick,
      effect: this.status.val,
    };
    battleLog.success(args);
  }
}
