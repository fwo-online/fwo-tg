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
   */
  async broadcast(data) {
    await this.bot.telegram.sendMessage(chatId, data);
  },
  /**
   * Отправка кнопок при начале заказа
   * @todo добавить в объект playersArr из GameService tgId и передавать сюда
   */
  async sendOrderButtons() {
    const playersArr = Object.keys(global.arena.players);
    playersArr.forEach(async (id) => {
      const message = await this.bot.telegram.sendMessage(
        global.arena.players[id].tgId,
        'ещё кнопки',
        Markup.inlineKeyboard([
          Markup.callbackButton('Атака', 'attack'),
          Markup.callbackButton('Лечение', 'handsHeal'),
          Markup.callbackButton('Защита', 'protect'),
          Markup.callbackButton('Реген', 'regen'),
        ]).resize().extra(),
      );
      this.messages[message.chat.id] = message.message_id;
    });
  },

  /**
   * Удаление кнопок после заказа   
   * @todo добавить в объект playersArr из GameService tgId и передавать сюда
   */
  async endOrderButtons() {
    const playersArr = Object.keys(global.arena.players);
    playersArr.forEach(async (id) => {
      this.messageId = await this.bot.telegram.deleteMessage(
        global.arena.players[id].tgId,
        this.messages[global.arena.players[id].tgId],
      );
    });
  },
};
