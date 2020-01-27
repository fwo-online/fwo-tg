const restartMiddleware = (ctx, next) => {
  if (!Object.keys(ctx.session.__scenes).length) {
    ctx.scene.enter('greeter');
  }
  next();
};
module.exports = restartMiddleware;
