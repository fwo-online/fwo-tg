const loginHelper = require('../helpers/loginHelper');

const authMiddleware = async ({ session, update }, next) => {
  if (!session.character && update.message) {
    session.character = await loginHelper.getChar(update.message.from.id);
  }
  next();
};

module.exports = authMiddleware;
