const chatMiddleware = async ({ chat }, next) => {
  if (chat && chat.type !== 'private') {
    return;
  }
  await next();
};

module.exports = chatMiddleware;
