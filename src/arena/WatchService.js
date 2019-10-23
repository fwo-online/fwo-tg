const arena = require('./index');
/**
 * Watchers
 *
 * @description Сервис контроля за обьектами Game/Round
 * @module Service/Watcher
 *
 */
global.arena.wch = {};

/**
 * Конструктор обьекта слежения за статусами игры
 */
class WatchConstructor {
  /**
   * @param {Object} gameObj обьект созанной игры
   */
  constructor(gameObj) {
    this.gameId = gameObj.info.id;
    // обработчики эвентов от раунда
    gameObj.preLoading();
    // @todo избавиться от Watchera
  }

  /**
   * @description Проверяем состояние обьекта global.arena.wch на пустые
   * Если пустая обнаружена выставляем в null
   *
   */
  // eslint-disable-next-line class-methods-use-this
  cleaner() {
    arena.wch.forEach((o) => {
      if (o.status === 'closed') delete arena.wch[o];
    });
  }
}

module.exports = {
  /**
   * @description Стартуем игру контролируем последовательность
   * @param {Object} gameObj обьект созданной игры
   */
  take(gameObj) {
    try {
      const watcher = new WatchConstructor(gameObj);
      arena.games[gameObj.info.id] = gameObj;
      arena.wch[watcher.gameId] = watcher;
      watcher.cleaner();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  },
};