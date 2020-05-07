const chatMiddleware = ({ chat }, next) => {
  if (chat && chat.type !== 'private') {
    return;
  }
  return next();
};

module.exports = chatMiddleware;
