const Markup = require('telegraf/markup');
/**
 * Помощник для отправки сообщений в общий чат
 */

const chatId = '-331233606';

module.exports = {
  bot: null,
  messages: {},
  /**
   * @param {string} data - текст отправляемого сообщения
   * @param {string} [id=chatId] - id чата
   */
  async broadcast(data, id = chatId) {
    await this.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
  },
  /**
   * Отправка кнопок при начале заказа
   * @param {object} playersArr - объект playerArr
   */
  async sendOrderButtons(playersArr) {
    playersArr.arr.forEach(async (player) => {
      const buttons = [
        [Markup.callbackButton('Атака', 'action_attack')],
        [Markup.callbackButton('Лечение', 'action_handsHeal')],
        [Markup.callbackButton('Защита', 'action_protect')],
        [Markup.callbackButton('Реген', 'action_regen')],
      ];
      const keys = Object.keys(player.magics);
      if (keys.length) {
        keys.forEach((key) => {
          buttons.push([Markup.callbackButton(key, `action_${key}`)]);
        });
      }
      const message = await this.bot.telegram.sendMessage(
        player.tgId,
        'Выбери действие',
        Markup.inlineKeyboard(buttons).resize().extra(),
      );
      this.messages[message.chat.id] = message.message_id;
    });
  },

  /**
   * Удаление кнопок после заказа
   * @param {object} playersArr - объект playerArr
   */
  async removeMessages(playersArr) {
    playersArr.arr.forEach(async (player) => {
      await this.bot.telegram.deleteMessage(
        player.tgId,
        this.messages[player.tgId],
      );
    });
  },

  async sendExitButton(playersArr) {
    playersArr.arr.forEach(async (player) => {
      const { exp, gold } = player.stats.collect;
      await this.bot.telegram.sendMessage(
        player.tgId,
        `Награда за бой:
⬆ ${exp}
💰 ${gold}
📖 ${Math.floor(exp / 100)}`,
        Markup.inlineKeyboard([Markup.callbackButton('Выход в лобби', 'exit')]).resize().extra(),
      );
    });
  },
};
