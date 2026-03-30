import { ForestEventAction, MonsterType } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
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

  const goldAmount = MiscService.randInt(1, 5) * forest.player.lvl;

  if (action === ForestEventAction.OpenChest) {
    // Маленький шанс встретить сильного врага
    const enemyChance = 0.1; // 10% шанс
    if (MiscService.chance(enemyChance)) {
      await startForestBattle(forest, MonsterType.Spirit, {
        gold: goldAmount * 2,
      });

      return {
        success: false,
        resolved: false,
        message: 'Из сундука вылетел злой дух!',
      };
    }

    const trapChance = 0.2; // 20% шанс
    if (MiscService.chance(trapChance)) {
      const maxHP = forest.player.stats.val('hp');
      const damage = floatNumber(maxHP * 0.1); // 10% урона

      return {
        success: false,
        resolved: true,
        message: `Сундук оказался ловушкой! Ты получил ${damage} урона!`,
        reward: {
          hp: -damage,
        },
      };
    }

    const rareGoldChance = 0.1; // 5% шанс найти редкий артефакт
    if (MiscService.chance(rareGoldChance)) {
      return {
        success: true,
        resolved: true,
        message: `Ты открыл сундук и обнаружил большой запас золота! Ты получил ${goldAmount * 5} золота!`,
        reward: {
          gold: goldAmount * 5,
        },
      };
    }

    // Награда по стандартной формуле
    return {
      success: true,
      resolved: true,
      message: `Ты открыл сундук и нашёл несколько монет! Ты получил ${goldAmount} золота!`,
      reward: {
        gold: goldAmount,
      },
    };
  }

  throw new Error(`Invalid action for chest event: ${action}`);
};
