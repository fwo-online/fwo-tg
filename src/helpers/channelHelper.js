/**
 * Помощник для отправки сообщений в общий чат
 */

const chatId = '-331233606';

module.exports = {
  bot: null,
  /**
   * @param {string} data - текст отправляемого сообщения
   */
  async broadcast(data) {
    await this.bot.telegram.sendMessage(chatId, data);
  },
};
