import arena from '@/arena';
import { ActionService } from '@/arena/ActionService';
import { RoundStatus } from '@/arena/RoundService';
import OrderError from '@/arena/errors/OrderError';
import _ from 'lodash';

export interface Order {
  initiator: string;
  target: string;
  action: string;
  proc: number;
}

/**
 * OrderService
 *
 * @description Сервис обработки входящих заказов игроков
 * @module Service/Order
 * @todo Нужно доработать структуру и Error
 * @todo для скиллов нужна жесткая проверка заказанных процентов
 */
export default class Orders {
  /** Текущий список заказов */
  ordersList: Order[] = [];
  /** История заказов */
  hist: Order[][] = [];

  /**
   * @desc Проверка доступно ли действие для персонажа
   */
  static isValidAct({ initiator, action }: Order): boolean {
    if (ActionService.isBaseAction(action)) {
      return true;
    }
    const { skills, magics } = arena.characters[initiator];
    return (skills?.[action] ?? magics?.[action] ?? 0) > 0;
  }

  get lastOrders(): Order[] {
    return this.hist[this.hist.length - 1];
  }

  /**
   * @desc Функция приёма заказов
   * @param order объект заказа
   * @example
   * {
   *  initiator: '123abc',
   *  target: 'abc123',
   *  proc: 10,
   *  action: 'handsHeal',
   * }
   * @throws {OrderError}
   */
  orderAction(order: Order): void {
    const {
      initiator, target, action, proc,
    } = order;
    console.log('orderAction >', initiator);

    // формируем список заказа для charId

    const Game = arena.characters[initiator].currentGame;
    // @todo Нужны константы для i18n
    if (!Game) {
      throw new OrderError('Вы не в игре', order);
    }
    if (Game.round.status !== RoundStatus.START_ORDERS) {
      throw new OrderError('Раунд ещё не начался', order);
      // @todo тут надо выбирать из живых целей
    }
    if (!Game.players.getById(target)?.alive) {
      throw new OrderError('Нет цели или цель мертва', order);
    }
    if (Number(proc) > Number(Game.players.getById(initiator)?.proc)) {
      throw new OrderError('Нет процентов', order);
      // тут нужен геттер из Player
    }
    if (this.isMaxTargets(order)) {
      throw new OrderError('Слишком много целей', order);
    }
    if (!Orders.isValidAct(order)) {
      throw new OrderError(`action spoof:${action}`);
    }
    // временный хак для атаки руками
    // @todo нужно дописать структуру атаки руками
    const a: Order = {
      initiator, target, action, proc,
    };
    // if (action === 'attack') {
    //   a.hand = 'righthand';
    // }
    Game.players.getById(initiator)?.setProc(Number(Game.players.getById(initiator)?.proc) - proc);
    console.log('order :::: ', a);
    this.ordersList.push(a);
  }

  /**
   * Функция отмены всех действия цели
   * @param charId идентификатор игрока
   */
  block(charId: string): void {
    this.ordersList = _.pullAllWith(this.ordersList, [
      {
        initiator: charId,
      }], _.isEqual);
    console.log('block order', this.ordersList);
  }

  /**
   * Очищаем массив заказов
   */
  reset(): void {
    this.hist.push(this.ordersList);
    this.ordersList = [];
  }

  /**
   * @desc проверка достижения максимального кол-ва целей при атаке
   */
  isMaxTargets({ initiator, action }: Order): boolean {
    return this.getNumberOfOrder(initiator, action) >= arena.characters[initiator].dynamicAttributes.maxTarget;
  }

  /**
   * Возвращает все заказы игрока в текущем раунда
   * @param charId идентификатор персонажа
   */
  getPlayerOrders(charId: string): Order[] {
    return this.ordersList.filter((o) => o.initiator === charId);
  }

  /**
   * Проверяет делал ли игрок заказ. Опционально проверяет название магии или умения в заказе
   * @param charId идентификатор персонажа
   * @param act название умения или магии
   */
  checkPlayerOrder(charId: string, act?: string): boolean {
    return this.ordersList.some((o) => o.initiator === charId && (act ? o.action === act : true));
  }

  /**
   * Проверяет делал ли игрок заказ в предыдущем раунде
   * @param charId идентификатор персонажа
   */
  checkPlayerOrderLastRound(charId: string): boolean {
    return this.lastOrders.some((o) => o.initiator === charId);
  }

  /**
   * Возвращает количество заказов игрока для данного умения
   * @param charId идентификатор персонажа
   * @param action название умения или магии
   * @returns количество заказов игрока для данного умения
   */
  getNumberOfOrder(charId: string, action: string): number {
    return this.ordersList.filter((o) => o.initiator === charId && o.action === action).length;
  }

  /**
   * Повторяет заказ для игрока
   * @param charId идентификатор персонажа
   */
  repeatLastOrder(charId: string): void {
    this.lastOrders.forEach((order) => {
      if (order.initiator === charId) {
        try {
          this.orderAction(order);
        } catch (e) {
          console.log('Error in orders:', e);
        }
      }
    });
  }

  /**
   * Сбрасывает заказ для игрока
   * @param charId идентификатор персонажа
   */
  resetOrdersForPlayer(charId: string): void {
    this.ordersList = this.ordersList.filter((o) => o.initiator !== charId);
    const Game = arena.characters[charId].currentGame;
    Game.players.getById(charId)?.setProc(100);
  }
}
