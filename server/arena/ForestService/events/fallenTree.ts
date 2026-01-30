import { ForestEventAction, MonsterType } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import type { ForestEventHandler } from './types';

export const handleFallenTreeEvent: ForestEventHandler = async (action) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      message: 'Ты прошёл мимо упавшего дерева.',
    };
  }

  if (action === ForestEventAction.ChopTree) {
    // Шанс появления паука
    const spiderChance = 0.3; // 30% шанс
    if (Math.random() < spiderChance) {
      return {
        success: false,
        message: 'Из дерева выполз огромный паук!',
        startBattle: true,
        monsterType: MonsterType.Spider,
      };
    }

    const woodAmount = MiscService.randInt(1, 2);
    return {
      success: true,
      message: `Ты разрубил дерево и получил ${woodAmount} досок!`,
      reward: {
        components: {
          wood: woodAmount,
        },
      },
    };
  }

  throw new Error(`Invalid action for fallen tree event: ${action}`);
};
