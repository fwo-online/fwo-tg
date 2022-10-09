import _ from 'lodash';
import actions from './actions';
import config from './config';
import type Game from './GameService';
import * as magics from './magics';
import * as skills from './skills';

const ACTIONS = {
  ...actions, ...magics, ...skills,
};
type ActionKeys = keyof typeof ACTIONS;
type Stages = (ActionKeys | ActionKeys[])[]
const STAGES = config.stages as Stages;

/**
 * @param ar массив строк
 * @param gameObj объект игры
 * @return измененный объект игры
 */
function runStage(ar: Stages, gameObj: Game) {
  const allActions = { ...ACTIONS };
  const ord = _.groupBy(gameObj.orders.ordersList, ({ action }) => action);
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
