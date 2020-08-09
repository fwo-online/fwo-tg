const protecredMiddleware = (ctx, next) => {
  if (!ctx.session.character) {
    return;
  }
  next();
};

module.exports = protecredMiddleware;
