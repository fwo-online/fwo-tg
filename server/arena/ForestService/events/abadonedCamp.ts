import { ForestEventAction, MonsterType } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import type { ForestEventHandler } from './types';

export const handleAbandonedCampEvent: ForestEventHandler = async (action) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      message: 'Ты прошёл мимо заброшенного лагеря.',
    };
  }

  if (action === ForestEventAction.ScavengeCamp) {
    // Шанс появления паука
    const dangerChance = 0.25; // 25% шанс
    if (Math.random() < dangerChance) {
      return {
        success: false,
        message: 'Из палатки выскочил паук!',
        startBattle: true,
        monsterType: MonsterType.Spider,
      };
    }

    const fabricAmount = MiscService.randInt(1, 2);
    return {
      success: true,
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
