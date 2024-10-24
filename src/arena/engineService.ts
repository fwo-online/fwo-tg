import _ from 'lodash';
import * as actions from './actions';
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
          const initiator = gameObj.players.getById(o.initiator);
          const target = gameObj.players.getById(o.target);
          if (initiator && target) {
            initiator.setProc(o.proc / 100);
            act.cast(initiator, target, gameObj);
          } else {
            console.log('stage fail (no player):', initiator?.id, target?.id);
          }
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
export function engine(gameObj: Game): Game | undefined {
  try {
    return runStage(STAGES, gameObj);
  } catch (e) {
    console.debug(e);
  } finally {
    console.info('engine done');
  }
}
