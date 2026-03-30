import { ForestEventAction, ItemComponent, MonsterType } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import type { ForestEventHandler } from './getEventHandler';
import { startForestBattle } from './startForestBattle';

export const handleAbandonedSwordEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      resolved: true,
      message: 'Ты прошёл мимо заброшенного меча.',
    };
  }

  if (action === ForestEventAction.TakeSword) {
    // Шанс призрака
    const ghostChance = 0.5; // 50% шанс
    if (Math.random() < ghostChance) {
      await startForestBattle(forest, MonsterType.Ghost, {
        components: {
          [ItemComponent.Iron]: MiscService.randInt(0, 2),
          [ItemComponent.Steel]: MiscService.randInt(1, 2),
          [ItemComponent.Wood]: MiscService.randInt(0, 2),
        },
      });

      return {
        success: false,
        resolved: false,
        message: 'Меч был проклят! Появился призрак владельца!',
      };
    }

    const steelAmount = MiscService.randInt(1, 2);
    return {
      success: true,
      resolved: true,
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
