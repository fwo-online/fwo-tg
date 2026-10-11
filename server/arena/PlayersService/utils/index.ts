import type { ActionKey } from '@/arena/ActionService';
import type { Chance } from '@/arena/PlayersService';
import type { Modifiers } from '@fwo/shared';

export function convertItemModifiers(modifiers: Modifiers[]): Chance {
  return modifiers.reduce<Chance>(
    (acc, { type, chance }) => {
      const action = type as ActionKey;
      if (chance < 0) {
        acc.fail[action] ??= 0;
        acc.fail[action] -= chance;
      } else {
        acc.cast[action] ??= 0;
        acc.cast[action] += chance;
      }

      return acc;
    },
    { fail: {}, cast: {} },
  );
}
