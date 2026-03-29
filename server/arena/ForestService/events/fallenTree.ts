import { ForestEventAction, MonsterType } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import type { ForestEventHandler } from './getEventHandler';
import { startForestBattle } from './startForestBattle';

export const handleFallenTreeEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      resolved: true,
      message: 'Ты прошёл мимо упавшего дерева.',
    };
  }

  if (action === ForestEventAction.ChopTree) {
    // Шанс появления паука
    const spiderChance = 0.3; // 30% шанс
    if (Math.random() < spiderChance) {
      await startForestBattle(forest, MonsterType.Spider);

      return {
        success: false,
        resolved: false,
        message: 'Из дерева выполз огромный паук!',
      };
    }

    const woodAmount = MiscService.randInt(1, 2);
    return {
      success: true,
      resolved: true,
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
