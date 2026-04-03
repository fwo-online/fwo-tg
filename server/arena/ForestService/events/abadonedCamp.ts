import { ForestEventAction, ItemComponent, MonsterType } from '@fwo/shared';
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

  const fabricAmount = MiscService.randInt(1, 2);

  if (action === ForestEventAction.ScavengeCamp) {
    // Шанс появления паука
    if (forest.checkEventChance(0.25)) {
      await startForestBattle(forest, MonsterType.Spider, {
        components: {
          [ItemComponent.Fabric]: fabricAmount,
          [ItemComponent.Leather]: MiscService.randInt(0, 2),
        },
      });

      return {
        success: false,
        resolved: false,
        message: 'Из палатки выскочил паук!',
      };
    }

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
