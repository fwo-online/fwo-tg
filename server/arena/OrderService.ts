import { ActionService, type ActionKey } from '@/arena/ActionService';
import { type RoundService, RoundStatus } from '@/arena/RoundService';
import OrderError from '@/arena/errors/OrderError';
import type PlayersService from '@/arena/PlayersService';
import type { Player } from '@/arena/PlayersService';
import ValidationError from '@/arena/errors/ValidationError';
import { randomUUIDv7 } from 'bun';

export interface Order {
  initiator: string;
  target: string;
  action: string;
}

export interface OrderOutput extends Order {
  id: string;
  action: ActionKey;
}

export interface OrderResult {
  orders: OrderOutput[];
  ap: number;
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
  ordersList: OrderOutput[] = [];
  /** История заказов */
  hist: OrderOutput[][] = [];
  readyIDs = new Set<string>();
  readyTimer?: Timer;

  playersService: PlayersService;
  roundService: RoundService;

  constructor(playersService: PlayersService, roundService: RoundService) {
    this.playersService = playersService;
    this.roundService = roundService;
  }

  get lastOrders() {
    return this.hist.at(-1);
  }

  /**
   * @desc Функция приёма заказов
   * @param order объект заказа
   * @example
   * {
   *  initiator: '123abc',
   *  target: 'abc123',
   *  action: 'handsHeal',
   * }
   * @returns заказы игрока
   * @throws {OrderError}
   */
  orderAction(order: Order): OrderOutput[] {
    console.log('orderAction >', order.initiator);

    const initiator = this.playersService.getById(order.initiator);
    const target = this.playersService.getById(order.target);

    this.validateInitiator(initiator, order);
    this.validateTarget(target, order);
    this.validateAction(initiator, target, order);
    this.validateOrder(initiator, order);

    const apCost = ActionService.getActionPointCost(order.action);
    initiator.takeAP(apCost);
    console.log('order :::: ', order);

    this.ordersList.push({
      ...order,
      id: randomUUIDv7(),
      action: order.action as ActionKey,
    });

    return this.ordersList.filter(({ initiator }) => initiator === order.initiator);
  }

  /**
   * Валидация заказа
   * @throws {OrderError}
   */
  private validateOrder(initiator: Player, order: Order) {
    // @todo Нужны константы для i18n
    if (this.roundService.status !== RoundStatus.START_ORDERS) {
      throw new OrderError('Раунд ещё не начался', order);
    }
    if (this.isMaxTargets(order, initiator)) {
      throw new OrderError('Слишком много целей', order);
    }
    if (this.isMaxActionOrders(order)) {
      throw new OrderError('Действие больше нельзя повторить', order);
    }
  }

  private validateInitiator(
    initiator: Player | undefined,
    order: Order,
  ): asserts initiator is Player {
    if (!initiator) {
      throw new OrderError('Вы не в игре', order);
    }
    if (!initiator.alive) {
      throw new OrderError('Вы мертвы', order);
    }
  }

  private validateTarget(target: Player | undefined, order: Order): asserts target is Player {
    if (!target || !target.alive) {
      throw new OrderError('Нет цели или цель мертва', order);
    }
  }

  private validateAction(
    initiator: Player,
    target: Player,
    order: Order,
  ): asserts order is OrderOutput {
    if (!this.isValidAction(order, initiator)) {
      console.warn(`action spoof: ${order.action} ${initiator.nick}`);
      throw new OrderError(`action spoof: ${order.action}`);
    }

    if (!this.isValidOrderType(order, initiator, target)) {
      console.warn(`order type spoof: ${order.action} ${initiator.nick} ${target.nick}`);
      throw new OrderError(`order type spoof: ${order.action}`);
    }
  }

  isValidOrderType(order: OrderOutput, initiator: Player, target: Player): boolean {
    const { orderType } = ActionService.toObject(order.action);

    switch (orderType) {
      case 'self':
        return initiator.id === target.id;
      case 'team':
        return initiator.isAlly(target, true);
      case 'teamExceptSelf':
        return initiator.isAlly(target, false);
      case 'enemy':
        return !initiator.isAlly(target, true);
      default:
        return true;
    }
  }

  /**
   * Функция отмены всех действия цели
   * @param charId идентификатор игрока
   */
  block(charId: string): void {
    this.ordersList = this.ordersList.filter((order) => order.initiator !== charId);
    console.log('block order', this.ordersList);
  }

  /**
   * Очищаем массив заказов
   */
  reset(): void {
    this.hist.push(this.ordersList);
    this.ordersList = [];
    this.readyIDs.clear();
  }

  /**
   * Проверка достижения максимального кол-ва целей при атаке
   */
  isMaxTargets({ initiator, action }: Order, player: Player): boolean {
    if (action === 'attack') {
      return this.getNumberOfOrder(initiator, action) >= player.stats.val('maxTarget');
    }
    return false;
  }

  isMaxActionOrders(order: Order): boolean {
    if (ActionService.isSkillAction(order.action) || ActionService.isMagicAction(order.action)) {
      return this.checkPlayerOrder(order.initiator, order.action);
    }

    return false;
  }

  /**
   * Проверка доступно ли действие для персонажа
   */
  isValidAction(order: Order, player: Player): order is OrderOutput {
    if (ActionService.isBaseAction(order.action)) {
      return true;
    }

    if (!ActionService.isAction(order.action)) {
      return false;
    }

    if (!player.getSkillLevel(order.action) && !player.getMagicLevel(order.action)) {
      return false;
    }

    return true;
  }

  /**
   * Возвращает все заказы игрока в текущем раунда
   * @param charId идентификатор персонажа
   */
  getPlayerOrders(charId: string): OrderOutput[] {
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
  checkPlayerOrderLastRound(charId: string) {
    return this.lastOrders?.some((o) => o.initiator === charId);
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
  repeatLastOrder(charId: string): OrderOutput[] {
    if (this.checkPlayerOrder(charId) || !this.checkPlayerOrderLastRound(charId)) {
      throw new ValidationError('Нельзя повторить заказ');
    }

    const lastOrders = this.lastOrders ?? [];
    return lastOrders.reduce<OrderOutput[]>((prev, order) => {
      if (order.initiator === charId) {
        return this.orderAction(order);
      }
      return prev;
    }, []);
  }

  /**
   * Сбрасывает заказ для игрока
   * @param charId идентификатор персонажа
   */
  resetOrdersForPlayer(charId: string): OrderOutput[] {
    this.ordersList = this.ordersList.filter((o) => o.initiator !== charId);

    const player = this.playersService.getById(charId);
    player?.resetAP();

    return [];
  }

  removeAction(charId: string, orderId: string) {
    const orders = this.ordersList.filter(
      (order) => order.initiator === charId && order.id !== orderId,
    );
    const initialOrders = this.resetOrdersForPlayer(charId);

    return orders.reduce((_, order) => this.orderAction(order), initialOrders);
  }

  setReady(charID: string, ready: boolean) {
    clearTimeout(this.readyTimer);

    if (ready) {
      this.readyIDs.add(charID);
    } else {
      this.readyIDs.delete(charID);
    }

    const isEveryReady = this.playersService.aliveNonBotPlayers.every(({ id }) =>
      this.readyIDs.has(id),
    );

    this.readyTimer = setTimeout(() => {
      if (isEveryReady) {
        this.roundService.endOrders();
      }
    }, 2000);
  }
}
