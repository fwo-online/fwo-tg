const { stages } = require('./config');
const CharacterService = require('./CharacterService');
const GameService = require('./GameService');
const testGame = require('./testGame');

/**
 * @param {Array} ar массив строк
 * @param {Object} gameObj обьект игры
 * @return {Object} измененный обьет игры
 */
function runStage(ar, gameObj) {
  const act = { ...ACTIONS };
  const ord = sortOrders(gameObj.orders.ordersList);
  ar.forEach((x) => {
    if (typeof x !== 'string') {
      runStage(x, gameObj);
    } else {
      // eslint-disable-next-line no-console
      console.log('stage run:', x);
      if (act[x] && ord[x]) {
        const ordObj = ord[x];
        ordObj.forEach((o) => {
          const initiator = gameObj.players[o.initiator];
          const target = gameObj.players[o.target];
          initiator.proc = o.proc / 100;
          act[x].cast(initiator, target, gameObj);
        });
      }
      if (act[x] && act[x].isLong) {
        // запуск LongMagic
        act[x].checkLong(gameObj);
      }
      if (act[x] && act[x].postEffect) {
        act[x].postEffect(gameObj);
      }
    }
  });
  return gameObj;
}

/**
 * Сортируем список заказов
 * @param {Array} ordersArr
 * @return {Object} {action:[{initiator:x,target:y,action:z,proc:100}}
 */
function sortOrders(ordersArr) {
  return _.groupBy(ordersArr, 'action');
}

/**
 * Engine
 * Модуль обработки боя
 * @todo wip
 */
const { arena } = global;
arena.magics = require('./magics');

const ACTIONS = arena.magics;

const STAGES = stages;

/**
 * @param {Object} gameObj Обьект игры
 * @return {Boolean} true
 * */
async function engine(gameObj) {
  try {
    if (!gameObj) {
      // кастылик для запуска debug fight
      await CharacterService.loading(1); // загрузка 2х чаров
      await CharacterService.loading(2);
      const gameObject = new GameService([1, 2]);
      await gameObject.createGame();
      gameObject.orders = { ordersList: testGame.orders };
      return runStage(STAGES, gameObject);
    }
    return runStage(STAGES, gameObj);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.debug(e);
  } finally {
    // eslint-disable-next-line no-console
    console.info('engine done');
  }
}


/**
 * Нужна функция которая отценивает на каком уровне выполняется action
 * Для возможности шафла порядка actions
 */
module.exports = engine;
