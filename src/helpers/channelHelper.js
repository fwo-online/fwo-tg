const Markup = require('telegraf/markup');
const { skills } = require('../arena/SkillService');
const arena = require('../arena');
/**
 * Помощник для отправки сообщений в общий чат
 * @typedef {import ('../arena/PlayerService')} Player
 * @typedef {import ('../arena/GameService')} Game
 */

const chatId = process.env.BOT_CHATID || -1001483444452;

module.exports = {
  bot: null,
  messages: {},
  statusMessages: {},
  /**
   * @param {string} data - текст отправляемого сообщения
   * @param {Number|String} [id=chatId] - id чата
   */
  async broadcast(data, id = chatId) {
    await this.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
  },

  /**
   * Отправляет статус игры игрокам
   * @param {string} data - текст отправляемого сообщения
   * @param {number} id - id чата
   */
  async sendStatus(data, id) {
    if (!this.statusMessages[id]) {
      const message = await this.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
      this.statusMessages[id] = message.message_id;
    } else {
      this.updateStatus(data, id);
    }
  },
  /**
   * Обновляет статус игры у игроков
   * @param {string} data - текст отправляемого сообщения
   * @param {number} id - id чата
   */
  async updateStatus(data, id) {
    await this.bot.telegram.editMessageText(
      id,
      this.statusMessages[id],
      '',
      data,
      { parse_mode: 'Markdown' },
    );
  },
  /**
   * Получение кнопок заказа. Базовые кнопки + доступные магии
   * @param {Player} player - объект игрока
   */
  getOrderButtons(player) {
    const buttons = [
      [Markup.callbackButton('Атака', 'action_attack')],
      [Markup.callbackButton('Лечение', 'action_handsHeal')],
      [Markup.callbackButton('Защита', 'action_protect')],
      [Markup.callbackButton('Реген', 'action_regen')],
    ];

    Object.keys(player.magics)
      .forEach((m) => {
        buttons.push([Markup.callbackButton(arena.magics[m].displayName, `action_${m}`)]);
      });

    const gameId = arena.characters[player.id].mm;
    /** @type {Game} */
    const Game = arena.games[gameId];

    Object.keys(player.skills)
      .filter((s) => skills[s].proc <= player.proc && !Game.orders.checkPlayerOrder(player.id, s))
      .forEach((s) => {
        buttons.push([Markup.callbackButton(`${skills[s].displayName} (${skills[s].proc}%)`, `action_${s}`)]);
      });
    return buttons;
  },
  /**
   * Отправка кнопок при начале заказа
   * @param {Player} player - объект игрока
   */
  async sendOrderButtons(player) {
    const message = await this.bot.telegram.sendMessage(
      player.tgId,
      'Выбери действие',
      Markup.inlineKeyboard(this.getOrderButtons(player)).resize().extra(),
    );
    this.messages[message.chat.id] = message.message_id;
  },

  /**
   * Удаление кнопок после заказа
   * @param {Player} player - объект игрока
   */
  async removeMessages(player) {
    await this.bot.telegram.deleteMessage(
      player.tgId,
      this.messages[player.tgId],
    );
  },

  /**
   * Отправляет статистику и кнопку выхода в лобби
   * @param {Player} player
   */
  async sendExitButton(player) {
    const { exp, gold } = player.stats.collect;
    await this.bot.telegram.sendMessage(
      player.tgId,
      `Награда за бой:
📖 ${exp}
💰 ${gold}`,
      Markup.inlineKeyboard([Markup.callbackButton('Выход в лобби', 'exit')]).resize().extra(),
    );
  },

  /**
   * Отправляет сообщение для сбежавшего и кнопку выхода в лобби
   * @param {Player} player
   */
  async sendRunButton(player) {
    await this.bot.telegram.sendMessage(
      player.tgId,
      'Ты бежал из боя',
      Markup.inlineKeyboard([Markup.callbackButton('Выход в лобби', 'exit')]).resize().extra(),
    );
  },
};
