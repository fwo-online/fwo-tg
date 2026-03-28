import { ForestEventAction, MonsterType } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import type { ForestEventHandler } from './getEventHandler';
import { startForestBattle } from './startForestBattle';

export const handleChestEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      resolved: true,
      message: 'Ты прошёл мимо сундука.',
    };
  }

  const goldAmount = MiscService.randInt(10, 50) * forest.player.lvl;

  if (action === ForestEventAction.OpenChest) {
    // Маленький шанс встретить сильного врага
    const enemyChance = 0.1; // 10% шанс
    if (Math.random() < enemyChance) {
      await startForestBattle(forest, MonsterType.Spirit, {
        gold: goldAmount * 2,
      });

      return {
        success: false,
        resolved: false,
        message: 'Из сундука вылетел злой дух!',
      };
    }

    // Награда по стандартной формуле
    return {
      success: true,
      resolved: true,
      message: `Ты открыл сундук и нашёл ${goldAmount} золота!`,
      reward: {
        gold: goldAmount,
      },
    };
  }

  throw new Error(`Invalid action for chest event: ${action}`);
};
