const chatMiddleware = async ({ update }, next) => {
  if (update.message.chat.type !== 'private') {
    return;
  }
  await next();
};

module.exports = chatMiddleware;
