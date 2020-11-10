import { floatNumber } from '../../utils/floatNumber';
import type Game from '../GameService';
import MiscService from '../MiscService';
import type Player from '../PlayerService';
import type {
  BaseNext, Breaks, BreaksMessage, CustomMessage, ExpArr, OrderType,
} from './types';

/**
 * @typedef {import ('../PlayerService').default} player
 * @typedef {import ('../GameService').default} game
 */

export type HealNext = Omit<BaseNext, 'exp'> & {
  actionType: 'heal';
  effect: number;
  expArr: ExpArr;
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

  static sumNextParams(msgObj: HealNext[]): HealNext[] {
    const messages = msgObj.reduce((sum, curr) => {
      const { target } = curr;
      if (!sum[target]) {
        sum[target] = curr;
        return sum;
      }
      sum[target] = {
        ...sum[target],
        expArr: [...sum[target].expArr, ...curr.expArr],
        effect: sum[target].effect + curr.effect,
      };
      return sum;
    }, {} as Record<string, HealNext>);
    return Object.values(messages);
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
      this.status.exp = this.getExp(initiator, target, game);
      // this.backToLife();
      this.next();
    } catch (e) {
      const { battleLog } = this.params.game;
      battleLog.log(e);
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
   * @param obj
   */
  breaks(message: BreaksMessage): Breaks {
    const { target, initiator } = this.params;
    return {
      message,
      target: target.nick,
      initiator: initiator.nick,
      actionType: 'heal',
      action: this.displayName,
    };
  }

  /**
   * Функция вычисления размера хила
   * @return размер хила
   */
  effectVal(): number {
    const { initiator, target } = this.params;
    const proc = initiator.proc ?? 0;
    const hl = initiator.stats.val('hl');
    const maxHp = target.stats.val('maxHp');
    const curHp = target.stats.val('hp');

    const allHeal = MiscService.randInt(hl.min, hl.max) * proc;
    const maxHeal = maxHp - curHp;
    const healEffect = Math.min(maxHeal, allHeal);

    return floatNumber(healEffect);
  }

  getExp(initiator: Player, target: Player, game: Game): number {
    if (game.isPlayersAlly(initiator, target)) {
      const healEffect = this.status.val;
      const exp = Math.round(healEffect * 8);
      initiator.stats.up('exp', exp);
      return exp;
    }
    return 0;
  }
  /**
   * Функция положительного прохождения
   */
  next(): void {
    const { target, initiator } = this.params;
    const { battleLog } = this.params.game;
    const exp: ExpArr[number] = {
      name: initiator.nick,
      exp: this.status.exp,
      val: this.status.val,
    };
    const args: HealNext = {
      expArr: [exp],
      action: this.displayName,
      actionType: 'heal',
      target: target.nick,
      initiator: initiator.nick,
      effect: this.status.val,
    };
    battleLog.success(args);
  }
}
