const chatMiddleware = (ctx, next) => {
  if (ctx.chat && ctx.chat.type !== 'private') {
    return;
  }
  return next();
};

module.exports = chatMiddleware;
