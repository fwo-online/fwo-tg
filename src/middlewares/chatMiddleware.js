const chatMiddleware = async ({ update }, next) => {
  if (update.message.chat.type !== 'private') {
    return;
  }
  next();
};

module.exports = chatMiddleware;
