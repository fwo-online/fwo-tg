import { ForestEventAction } from '@fwo/shared';
import type { ForestEventHandler } from './types';

export const handleCampfireEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      message: 'Ты прошёл мимо костра.',
    };
  }

  if (action === ForestEventAction.Rest) {
    const maxHeal = forest.player.stats.val('base.hp') - forest.player.stats.val('hp');
    const baseHeal = Math.floor(forest.player.stats.val('base.hp') * 0.5);
    const healAmount = Math.min(baseHeal, maxHeal); // 50% восстановления
    return {
      success: true,
      message: `Ты отдохнул у костра и восстановил ${healAmount} HP!`,
      reward: {
        hp: healAmount,
      },
    };
  }

  throw new Error(`Invalid action for campfire event: ${action}`);
};
