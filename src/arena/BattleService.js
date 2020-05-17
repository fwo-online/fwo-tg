const Markup = require('telegraf/markup');
const arena = require('./index');

/**
 * @typedef {import ('./PlayerService')} Player
 * @typedef {import ('./GameService')} Game
 */

const getActions = () => ({ ...arena.actions, ...arena.skills, ...arena.magics });
module.exports = {
  getActions,
  /**
   * @param {string} action
   * @param {Game} game
   */
  getTargetButtons(initiator, game, action) {
    const player = game.players[initiator];
    const { orderType } = getActions()[action];
    const proc = arena.skills[action] ? `_${arena.skills[action].proc}` : '';
    if (orderType === 'enemy') {
      return game.alivePlayers
        .filter((target) => !game.isPlayersAlly(player, target))
        .map(({ nick, id }) => Markup.callbackButton(nick,
          `${action}_${id}${proc}`));
    }
    if (orderType === 'self') {
      return [Markup.callbackButton(player.nick, `${action}_${initiator}${proc}`)];
    }
    return game.alivePlayers
      .map(({ nick, id }) => Markup.callbackButton(nick,
        `${action}_${id}${proc}`));
  },
  /**
   * @param {string} initiator
   * @param {Game} game
   */
  repeatOrder(initiator, game) {
    game.orders.repeatLastOrder(initiator);
  },
  /**
   * @param {string} initiator
   * @param {Game} game
   */
  resetOrder(initiator, game) {
    game.orders.resetOrdersForPlayer(initiator);
  },
  /**
   * @param {string} initiator
   * @param {Game} game
   */
  getCurrentOrders(initiator, game) {
    return game.orders.getPlayerOrders(initiator)
      .map((o) => `_${getActions()[o.action].displayName}_ (*${o.proc}%*) на игрока *${game.players[o.target].nick}*`)
      .join('\n');
  },
  /**
   * Возвращает кнопки с процентом заказа
   * @param {string} match
   * @param {number} proc
   */
  getProcentKeyboard(match, proc) {
    return Array.from(new Set([5, 10, 25, 50, 75, proc]))
      .filter((key) => key <= proc)
      .map((key) => Markup.callbackButton(key, `${match}_${key}`));
  },
};
