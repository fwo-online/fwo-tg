import actions from './actions';
import config from './config';
import type Game from './GameService';
import * as magics from './magics';
import type { Order } from './OrderService';
import * as skills from './skills';

const ACTIONS = {
  ...actions, ...magics, ...skills,
};
type ActionKeys = keyof typeof ACTIONS;
type Stages = (ActionKeys | ActionKeys[])[]
const STAGES = config.stages as Stages;

/**
 * Сортируем список заказов
 * @param ordersArr
 */
function sortOrders(ordersArr: Order[]): Record<string, Order[]> {
  const sortedOrder: Record<string, Order[]> = {};
  return ordersArr.reduce(
    // eslint-disable-next-line no-sequences,no-return-assign
    (r, v, _a, _b, k = v.action) => ((r[k] || (r[k] = [])).push(v), r), sortedOrder,
  );
}

/**
 * @param ar массив строк
 * @param gameObj объект игры
 * @return измененный объект игры
 */
function runStage(ar: Stages, gameObj: Game) {
  const allActions = { ...ACTIONS };
  const ord = sortOrders(gameObj.orders.ordersList);
  ar.forEach((x) => {
    if (typeof x !== 'string') {
      runStage(x, gameObj);
    } else {
      const act = allActions[x];
      console.log('stage run:', x);
      if (!act) return;

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
 * @param gameObj Объект игры
*/
export function engine(gameObj: Game): Game | void {
  try {
    return runStage(STAGES, gameObj);
  } catch (e) {
    console.debug(e);
  } finally {
    console.info('engine done');
  }
}
