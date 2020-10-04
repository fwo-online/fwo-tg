const { Markup } = require('telegraf');
const channelHelper = require('../helpers/channelHelper');
const arena = require('./index');

/**
 * Заказываем в три этапа:
 * 1. Выбор умения (action_{attack})
 * 2. Выбор цели ({attack}_{target})
 * 3. Выбор силы ({attack}_{target}_{proc})
 * @typedef {import ('./PlayerService').default} Player
 * @typedef {import ('./GameService')} Game
 * @typedef {import('telegraf/typings/markup').CallbackButton} CallbackButton
 */

const getActions = () => ({ ...arena.actions, ...arena.skills, ...arena.magics });

const getText = {
  order: (proc) => `У тебя осталось *${proc}%*
Заказы:\n`,
  proc: (displayName, target) => `Выбери силу _${displayName}_ на ${target ? `игрока ${target}` : 'себя'}`,
  target: (displayName) => `Выбери цель для _${displayName}_`,
};
/**
 * @param {Game} game
 * @param {import ('./OrderService').order} order
 */
const createOrder = (game, order) => {
  game.orders.orderAction(order);
};

/**
 * @param {string} charId
 * @param {Game} game
 */
const getCurrentOrders = (charId, game) => game.orders.getPlayerOrders(charId)
  .map((o) => {
    if (o.target === charId) {
      return `_${getActions()[o.action].displayName}_ (*${o.proc}%*) на *себя*`;
    }
    return `_${getActions()[o.action].displayName}_ (*${o.proc}%*) на игрока *${game.players[o.target].nick}*`;
  })
  .join('\n');

/**
 * @param {string} charId
 * @param {Game} game
 * @param {string} action
 * @returns {CallbackButton[]}
 */
const getTargetKeyboard = (charId, game, action) => {
  const player = game.players[charId];
  const { orderType } = getActions()[action];
  const proc = arena.skills[action] ? `_${arena.skills[action].proc}` : '';
  return game.alivePlayers
    .filter((target) => (orderType === 'enemy' ? !game.isPlayersAlly(player, target) : true))
    .map(({ nick, id }) => Markup.callbackButton(nick, `${action}_${id}${proc}`));
};

/**
 * Возвращает кнопки с процентом заказа
 * @param {string} action
 * @param {string} target
 * @param {number} proc
 * @returns {CallbackButton[]}
 */
const getProcentKeyboard = (action, target, proc) => Array
  .from(new Set([5, 10, 25, 50, 75, proc]))
  .filter((key) => key <= proc)
  .map((key) => Markup.callbackButton(key.toString(), `${action}_${target}_${key}`));

/**
 * Сообщение для первого этапа
 * @param {string} charId
 * @param {Game} game
 * @returns {[string, CallbackButton[][]]}
 */
const orderMessage = (charId, game) => {
  const player = game.players[charId];
  const message = getText.order(player.proc)
    .concat(getCurrentOrders(charId, game));
  const keyboard = channelHelper.getOrderButtons(player);
  return [message, keyboard];
};

/**
 * Сообщение для второго этапа
 * @param {string} charId
 * @param {Game} game
 * @param {string} action
 * @returns {[string, CallbackButton[]]}
 */
const targetMessage = (charId, game, action) => {
  const { displayName } = getActions()[action];
  const message = getText.target(displayName);
  const keyboard = getTargetKeyboard(charId, game, action);
  return [message, keyboard];
};

/**
 * Сообщение для третьего этапа
 * @param {string} charId
 * @param {Game} game
 * @param {string} action
 * @param {string} targetId
 * @returns {[string, CallbackButton[]]}
 */
const percentMessage = (charId, game, action, targetId) => {
  const { proc } = game.players[charId];
  const { nick } = game.players[targetId];
  const { displayName } = getActions()[action];
  const message = getText.proc(displayName, targetId === charId ? false : nick);
  const keyboard = getProcentKeyboard(action, targetId, proc);
  return [message, keyboard];
};

module.exports = {
  /**
   * Обработка выбранного действия (первый этап)
   * @param {string} charId
   * @param {Game} game
   * @param {string} action
   * @return {[string, CallbackButton[] | CallbackButton[][]]}
   */
  handleAction(charId, game, action) {
    if (action === 'repeat') return this.repeatOrder(charId, game);
    if (action === 'reset') return this.resetOrder(charId, game);

    const { orderType } = getActions()[action];
    const proc = arena.skills[action] ? arena.skills[action].proc : undefined;

    // Если умение направлено на себя и имеет процент (умения), то делаем заказ сразу
    if (orderType === 'self') {
      if (typeof proc !== 'undefined') {
        createOrder(game, {
          initiator: charId, target: charId, action, proc,
        });
        return orderMessage(charId, game);
      }
      return percentMessage(charId, game, action, charId);
    }
    return targetMessage(charId, game, action);
  },
  /**
   * Обработка выбранной цели (второй этап)
   * @param {string} charId
   * @param {Game} game
   * @param {string} action
   * @param {string} target
   */
  handleTarget(charId, game, action, target) {
    const proc = arena.skills[action] ? arena.skills[action].proc : undefined;

    if (typeof proc !== 'undefined') {
      createOrder(game, {
        initiator: charId, target, action, proc,
      });
      return orderMessage(charId, game);
    }
    return percentMessage(charId, game, action, target);
  },
  /**
   * Обработка выбранных процентов (третий этап)
   * @param {string} charId
   * @param {Game} game
   * @param {string} action
   * @param {string} target
   * @param {number} proc
   */
  handlePercent(charId, game, action, target, proc) {
    createOrder(game, {
      initiator: charId, target, action, proc,
    });
    return orderMessage(charId, game);
  },
  /**
   * @param {string} charId
   * @param {Game} game
   */
  repeatOrder(charId, game) {
    game.orders.repeatLastOrder(charId);
    return orderMessage(charId, game);
  },
  /**
   * @param {string} charId
   * @param {Game} game
   */
  resetOrder(charId, game) {
    game.orders.resetOrdersForPlayer(charId);
    return orderMessage(charId, game);
  },
};
