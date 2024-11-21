import arena from '@/arena';

export type Action = keyof typeof arena.actions;

export class ActionService {
  static isAction(maybeAction: string): maybeAction is Action {
    return maybeAction in arena.actions;
  }

  static isBaseAction(action: string) {
    if (ActionService.isAction(action)) {
      return arena.actions[action].lvl === 0;
    }

    return false;
  }
}
