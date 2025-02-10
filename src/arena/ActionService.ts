import arena from '@/arena';
import type { Action } from '@fwo/schemas';

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

  static toObject(action: ActionKey): Action {
    const c = arena.actions[action];

    if ('cost' in c && 'costType' in c) {
      return {
        name: c.name,
        displayName: c.displayName,
        costType: c.costType,
        cost: c.cost,
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
