import { ForestEventAction } from '@fwo/shared';
import { floatNumber } from '@/utils/floatNumber';
import type { ForestEventHandler } from './getEventHandler';

export const handleCampfireEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      resolved: true,
      message: 'Ты прошёл мимо костра.',
    };
  }

  if (action === ForestEventAction.Rest) {
    const maxHeal = Math.max(forest.player.stats.val('base.hp') - forest.player.stats.val('hp'), 0);
    const baseHeal = Math.floor(forest.player.stats.val('base.hp') * 0.5);
    const healAmount = floatNumber(Math.min(baseHeal, maxHeal)); // 50% восстановления
    return {
      success: true,
      resolved: true,
      message: `Ты отдохнул у костра и восстановил ${healAmount} HP!`,
      reward: {
        hp: healAmount,
      },
    };
  }

  throw new Error(`Invalid action for campfire event: ${action}`);
};
