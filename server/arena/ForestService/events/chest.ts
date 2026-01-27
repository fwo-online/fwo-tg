import { ForestEventAction } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import type { ForestEventHandler } from './types';

export const handleChestEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      message: 'Ты прошёл мимо сундука.',
    };
  }

  if (action === ForestEventAction.OpenChest) {
    // Маленький шанс встретить сильного врага
    const enemyChance = 0.1; // 10% шанс
    if (Math.random() < enemyChance) {
      return {
        success: false,
        message: 'Из сундука вылетел злой дух! (TODO: бой с духом)',
        // startBattle: true, // Пока закомментировано
      };
    }

    // Награда по стандартной формуле (TODO: использовать RewardService)
    const goldAmount = MiscService.randInt(10, 50) * forest.player.lvl;
    return {
      success: true,
      message: `Ты открыл сундук и нашёл ${goldAmount} золота!`,
      reward: {
        gold: goldAmount,
      },
    };
  }

  throw new Error(`Invalid action for chest event: ${action}`);
};
