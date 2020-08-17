const { Markup } = require('telegraf');
const BattleKeyboard = require('./BattleKeyboard');
const arena = require('../arena');
const { getIcon } = require('../arena/MiscService');
/**
 * Помощник для отправки сообщений в общий чат
 * @typedef {import ('../arena/PlayerService').default} Player
 * @typedef {import ('../arena/GameService')} Game
 */

const chatId = process.env.BOT_CHATID || -1001483444452;

module.exports = {
  /** @type {import('telegraf').Telegraf<import('../fwo').Bot>} */
  bot: null,
  /** @type {Object<string, number>} */
  messages: {},
  /** @type {Object<string, number>} */
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
    try {
      if (!this.statusMessages[id]) {
        const message = await this.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
        this.statusMessages[id] = message.message_id;
      } else {
        this.updateStatus(data, id);
      }
    } catch (e) {
      console.log(`error: sendOrderButtons: ${e.message} for ${id}`);
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
    return new BattleKeyboard(player)
      .setActions()
      .setMagics()
      .setSkills()
      .render();
  },
  /**
   * Отправка кнопок при начале заказа
   * @param {Player} player - объект игрока
   */
  async sendOrderButtons(player) {
    try {
      const message = await this.bot.telegram.sendMessage(
        player.tgId,
        'Выбери действие',
        Markup.inlineKeyboard(this.getOrderButtons(player)).resize().extra(),
      );
      this.messages[message.chat.id] = message.message_id;
    } catch (e) {
      console.log(`error: sendOrderButtons: ${e.message} for ${player.id}`);
    }
  },

  /**
   * Удаление кнопок после заказа
   * @param {Player} player - объект игрока
   */
  async removeMessages(player) {
    try {
      await this.bot.telegram.deleteMessage(
        player.tgId,
        this.messages[player.tgId],
      );
    } catch (e) {
      console.log(`error: removeMessages: ${e.message} for ${player.id}`);
    }
  },

  /**
   * Удаление сообщения со статусом игры
   * @param {Player} player - объект игрока
   */
  async removeStatusMessages(player) {
    try {
      await this.bot.telegram.deleteMessage(
        player.tgId,
        this.statusMessages[player.tgId],
      );
      delete this.statusMessages[player.tgId];
    } catch (e) {
      console.log(`error: removeStatusMessages: ${e.message} for ${player.id}`);
    }
  },

  /**
   * Отправляет статистику и кнопку выхода в лобби
   * @param {Player} player
   */
  async sendExitButton(player) {
    try {
      await this.removeStatusMessages(player);

      const { exp, gold } = player.stats.collect;
      const character = arena.characters[player.id];
      const {
        autoreg, nickname, lvl, prof, clan,
      } = arena.characters[player.id];

      const message = await this.bot.telegram.sendMessage(
        player.tgId,
        `Награда за бой:
  📖 ${exp} (${character.exp}/${character.nextLvlExp})
  💰 ${gold} (${character.gold})
  ${autoreg ? 'Идёт поиск новой игры...' : ''}`,
        Markup.inlineKeyboard([
          Markup.callbackButton('Остановить поиск', 'stop', !autoreg),
          Markup.callbackButton('Выход в лобби', 'exit', autoreg),
        ]).resize().extra(),
      );

      if (autoreg) {
        this.messages[message.chat.id] = message.message_id;
        this.broadcast(
          `Игрок ${clan ? `\\[${clan.name}]` : ''} *${nickname}* (${getIcon(prof)}${lvl}) начал поиск игры`,
        );
      }
    } catch (e) {
      console.log(`error: sendExitButton: ${e.message} for ${player.id}`);
    }
  },

  /**
   * Отправляет сообщение для сбежавшего и кнопку выхода в лобби
   * @param {Player} player
   */
  async sendRunButton(player) {
    await this.removeStatusMessages(player);

    await this.bot.telegram.sendMessage(
      player.tgId,
      'Ты бежал из боя',
      Markup.inlineKeyboard([Markup.callbackButton('Выход в лобби', 'exit')]).resize().extra(),
    );
  },
};
