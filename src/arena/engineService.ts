import actions from './actions';
import CharacterService from './CharacterService';
import config from './config';
import type Game from './GameService';
import GameService from './GameService';
import * as magics from './magics';
import postHeal from './magics/postHeal';
import type { Order } from './OrderService';
import * as skills from './skills';
import testGame from './testGame';

const ACTIONS = {
  ...actions, ...magics, ...skills, postHeal,
};
type ActionKeys = keyof typeof ACTIONS;
type Stages = (ActionKeys | ActionKeys[])[]
const STAGES = config.stages as Stages;

/**
 * Сортируем список заказов
 * @param ordersArr
 */
function sortOrders(ordersArr: Order[]): Record<string, Order[]> {
  // eslint-disable-next-line no-return-assign, no-sequences
  const sortedOrder: Record<string, Order[]> = {};
  return ordersArr.reduce(
    // eslint-disable-next-line no-sequences,no-return-assign
    (r, v, _a, _b, k = v.action) => ((r[k] || (r[k] = [])).push(v), r), sortedOrder,
  );
}

/**
 * @param ar массив строк
 * @param gameObj обьект игры
 * @return измененный обьет игры
 */
function runStage(ar: Stages, gameObj: Game) {
  const allActions = { ...ACTIONS };
  const ord = sortOrders(gameObj.orders.ordersList);
  ar.forEach((x) => {
    if (typeof x !== 'string') {
      runStage(x, gameObj);
    } else {
      // eslint-disable-next-line no-console
      const act = allActions[x];
      console.log('stage run:', x);
      if (!act) return;

      if ('postEffect' in act) {
        act.postEffect(gameObj);
        return;
      }
      if (ord[x]) {
        const ordObj = ord[x];
        ordObj.forEach((o) => {
          const initiator = gameObj.players[o.initiator];
          const target = gameObj.players[o.target];
          initiator.proc = o.proc / 100;
          act.cast(initiator, target, gameObj);
        });
      }
      if ('castLong' in act) {
        act.castLong(gameObj);
      }
    }
  });
  return gameObj;
}

/**
 * Engine
 * Модуль обработки боя
 * @todo wip
 */

/**
 * @param gameObj Обьект игры
*/
async function engine(gameObj: Game): Promise<Game | void> {
  try {
    if (!gameObj) {
      // кастылик для запуска debug fight
      await CharacterService.getCharacter(1); // загрузка 2х чаров
      await CharacterService.getCharacter(2);
      const gameObject = new GameService(['1', '2']);
      await gameObject.createGame();
      gameObject.orders.ordersList = testGame.orders;
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
