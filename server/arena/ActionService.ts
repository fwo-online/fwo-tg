import arena from '@/arena';
import type { Action } from '@fwo/shared';

export type ActionKey = keyof typeof arena.actions;

export class ActionService {
  static isAction(maybeAction: string): maybeAction is ActionKey {
    return maybeAction in arena.actions;
  }

  static isBaseAction(action: string) {
    if (ActionService.isAction(action)) {
      return arena.actions[action].lvl === 0;
    }

    return false;
  }

  static toObject(actionKey: ActionKey, lvl = 1): Action {
    const action = arena.actions[actionKey];

    const actionObject: Action = {
      name: action.name,
      displayName: action.displayName,
      orderType: action.orderType,
    };

    if ('cost' in action) {
      actionObject.cost = Array.isArray(action.cost) ? action.cost[lvl - 1] : action.cost;
    }

    if ('costType' in action) {
      actionObject.costType = action.costType;
    }

    if ('proc' in action) {
      actionObject.power = action.proc;
    }

    return actionObject;
  }
}
