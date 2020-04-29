const loginHelper = require('../helpers/loginHelper');

const authMiddleware = async ({ session, chat }, next) => {
  if (!session.character && chat.type === 'private') {
    const character = await loginHelper.getChar(chat.id);
    if (character) {
      session.character = character;
    }
  }
  next();
};

module.exports = authMiddleware;
