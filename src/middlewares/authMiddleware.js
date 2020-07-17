const loginHelper = require('../helpers/loginHelper');

const authMiddleware = async (ctx, next) => {
  if (!ctx.session.character && ctx.chat.type === 'private') {
    const character = await loginHelper.getChar(ctx.chat.id);
    if (character) {
      ctx.session.character = character;
    }
  }
  return next();
};

module.exports = authMiddleware;
