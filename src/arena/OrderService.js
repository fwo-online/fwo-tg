const CharacterService = require('./CharacterService');
const MiscService = require('./MagicService');
const GameService = require('./GameService');

/**
 * OrderService
 *
 * @description Сервис обработки входящих заказов игроков
 * @module Service/Order
 * @todo Нужно доработать структуру и Error
 * @todo для скиллов нужна жесткая проверка заказанных процентов
 */
class Orders {
  /**
   * Конструктор обьекта заказов внутри раунда
   */
  constructor() {
    this.ordersList = [];
    this.hist = {};
  }

  /**
   * @desc Функция приёма заказов
   * @param {Number} charId инициатор
   * @param {Number} target цель действия (charId)
   * @param {String} action действие
   * @param {Number} atcproc процент действия
   */
  orderAction(charId, target, action, atcproc) {
    // eslint-disable-next-line no-console
    console.log('orderAction >', charId);
    /**
     * initiator: '1',
     * target: '1',
     * proc: 10,
     * action: 'handsHeal',
     */
    if (_.isObject(action)) {
      action = action.name;
    }
    // формируем список заказа для ника
    const Game = CharacterService.getGameFromCharId(charId);
    // @todo Нужны константы для i18n
    if (!Game) {
      throw Error('Вы не в игре');
    } else if (Game.round.status !== 'orders') {
      throw Error('Раунд ещё не начался');
      // @todo тут надо выбирать из живых целей
    } else if (!Game.players[target].alive) {
      throw Error('Нет цели или цель мертва');
    } else if (Number(atcproc) > Game.players[charId].proc) {
      throw Error('Нет процентов');
      // тут нужен геттер из Player
    } else if (!isMaxTargets(charId)) {
      throw Error('Слишком много целей');
    } else if (isValidAct(action)) {
      // временный хак для атаки руками
      // @todo нужно дописать структуру атаки руками
      const a = {
        initiator: charId, target, action, proc: atcproc,
      };
      // if (action === 'attack') {
      //   a.hand = 'righthand';
      // }
      Game.players[charId].proc -= atcproc;
      // eslint-disable-next-line no-console
      console.log('order :::: ', a);
      this.ordersList.push(a);
    } else {
      // eslint-disable-next-line no-console
      console.error('action spoof:', action);
    }
  }

  /**
   * Функция смены цели заказа target
   * Смена производится на все типы кроме магий
   * @param {String} charId имя заказывающешо
   * @param {String} reason причина смена цели пока здесь название action
   * @todo возможно в reason на ещё понадобится инициатор
   */
  shuffle(charId, reason) {
    if (charId) {
      // ord - обьект заказа
      this.ordersList.forEach((ord) => {
        const initiator = ord.initiator.id;
        const { action } = ord;
        if (!MiscService.isMagic(action) && initiator === charId) {
          ord.target = GameService.randomAlive(ord.initiator.getGameId());
        }
      });
    } else {
      this.ordersList.forEach((ord) => {
        const { action } = ord;
        if (!MiscService.isMagic(action)) {
          ord.target = GameService.randomAlive(ord.initiator.getGameId());
        }
      });
    }
  }

  /**
   * Функция отмены всех действия цели
   * @param {String} charId имя заказывающешо
   */
  block(charId) {
    this.ordersList = _.pullAllWith(this.ordersList, [
      {
        initiator: charId,
      }], _.isEqual);
    // eslint-disable-next-line no-console
    console.log('block order', this.ordersList);
  }

  /**
   * Очищаем массив заказов
   */
  reset() {
    const keys = Object.keys(this.hist);
    const lastKey = keys[keys.length - 1];
    this.hist[lastKey + 1] = this.ordersList;
    if (!this.testOrdersList) {
      this.ordersList = [];
    } else {
      this.ordersList = this.testOrdersList;
    }
  }
}

/**
 * @desc проверка достижения максимального кол-ва целей при атаке
 * @param {Number} charId идентификатор [charId]
 * @return {Boolean}
 */
function isMaxTargets(charId) {
  return true;
}

/**
 * @desc Проверка доступно ли действие для персонажа
 * @param {String} action идентификатор действия
 * @return {Boolean}
 * @todo
 */
function isValidAct(action) {
  return true;
}

module.exports = Orders;
