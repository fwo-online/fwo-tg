const chatId = '-331233606';

module.exports = {
  bot: null,
  broadcast(data) {
    this.bot.telegram.sendMessage(chatId, data);
  },
};
