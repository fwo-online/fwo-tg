import { ForestEventAction, MonsterType } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import type { ForestEventHandler } from './getEventHandler';
import { startForestBattle } from './startForestBattle';

export const handleAbandonedCampEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      resolved: true,
      message: 'Ты прошёл мимо заброшенного лагеря.',
    };
  }

  if (action === ForestEventAction.ScavengeCamp) {
    // Шанс появления паука
    const dangerChance = 0.25; // 25% шанс
    if (Math.random() < dangerChance) {
      await startForestBattle(forest, MonsterType.Spider);

      return {
        success: false,
        resolved: false,
        message: 'Из палатки выскочил паук!',
      };
    }

    const fabricAmount = MiscService.randInt(1, 2);
    return {
      success: true,
      resolved: true,
      message: `Ты разобрал палатку и получил ${fabricAmount} ткани!`,
      reward: {
        components: {
          fabric: fabricAmount,
        },
      },
    };
  }

  throw new Error(`Invalid action for abandoned camp event: ${action}`);
};
