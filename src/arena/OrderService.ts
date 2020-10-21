import _ from 'lodash';
import actions from './actions';
import arena from './index';

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
    if (actions[action]) {
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
   * @throws {Error}
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
      throw Error('Вы не в игре');
    }
    if (Game.round.status !== 'orders') {
      throw Error('Раунд ещё не начался');
      // @todo тут надо выбирать из живых целей
    }
    if (!Game.players[target]?.alive) {
      throw Error('Нет цели или цель мертва');
    }
    if (Number(proc) > Game.players[initiator].proc) {
      throw Error('Нет процентов');
      // тут нужен геттер из Player
    }
    if (this.isMaxTargets(order)) {
      throw Error('Слишком много целей');
    }
    if (!Orders.isValidAct(order)) {
      throw Error(`action spoof:${action}`);
    }
    // временный хак для атаки руками
    // @todo нужно дописать структуру атаки руками
    const a: Order = {
      initiator, target, action, proc,
    };
    // if (action === 'attack') {
    //   a.hand = 'righthand';
    // }
    Game.players[initiator].proc -= proc;
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
    return this.getNumberOfOrder(initiator, action) >= arena.characters[initiator].def.maxTarget;
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
    Game.getPlayerById(charId).proc = 100;
  }
}
