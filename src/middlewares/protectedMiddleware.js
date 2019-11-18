const protecredMiddleware = ({ session }, next) => {
  if (!session.character) {
    return;
  }
  next();
};

module.exports = protecredMiddleware;
