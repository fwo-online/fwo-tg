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

  static toObject(action: ActionKey, lvl = 0): Action {
    const c = arena.actions[action];

    if ('cost' in c && 'costType' in c) {
      const cost = Array.isArray(c.cost) ? c.cost[lvl - 1] : c.cost;

      return {
        name: c.name,
        displayName: c.displayName,
        costType: c.costType,
        cost,
        orderType: c.orderType,
      };
    }

    return {
      name: c.name,
      displayName: c.displayName,
      orderType: c.orderType,
    };
  }
}
