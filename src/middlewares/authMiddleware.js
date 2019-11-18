const loginHelper = require('../helpers/loginHelper');

const authMiddleware = async ({ session, update }, next) => {
  if (!session.character && update.message) {
    const character = await loginHelper.getChar(update.message.from.id);
    if (character) {
      session.character = character;
    }
  }
  next();
};

module.exports = authMiddleware;
