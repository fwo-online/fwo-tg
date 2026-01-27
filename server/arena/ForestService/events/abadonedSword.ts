import { ForestEventAction } from '@fwo/shared';
import type { ForestEventHandler } from '@/arena/ForestService/events/types';
import MiscService from '@/arena/MiscService';

export const handleAbandonedSwordEvent: ForestEventHandler = async (action) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      message: 'Ты прошёl мимо заброшенного меча.',
    };
  }

  if (action === ForestEventAction.TakeSword) {
    // Шанс призрака
    const ghostChance = 0.2; // 20% шанс
    if (Math.random() < ghostChance) {
      return {
        success: false,
        message: 'Меч был проклят! Появился призрак владельца! (TODO: бой с призраком)',
        // startBattle: true,
      };
    }

    const steelAmount = MiscService.randInt(1, 2);
    return {
      success: true,
      message: `Ты забрал меч и получил ${steelAmount} стали!`,
      reward: {
        components: {
          steel: steelAmount,
        },
      },
    };
  }

  throw new Error(`Invalid action for abandoned sword event: ${action}`);
};
