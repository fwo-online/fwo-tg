const chatMiddleware = async ({ chat }, next) => {
  console.log(chat);
  if (chat && chat.type !== 'private') {
    return;
  }
  await next();
};

module.exports = chatMiddleware;
