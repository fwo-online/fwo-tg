import { ForestEventAction } from '@fwo/shared';
import type { ForestEventHandler } from '@/arena/ForestService/events/types';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';

export const handleOldTrapEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      message: 'Ты осторожно обошёл старый капкан.',
    };
  }

  if (action === ForestEventAction.DisarmTrap) {
    // Шанс получить урон или встретить паука
    const failChance = 0.3; // 30% шанс
    if (Math.random() < failChance) {
      const maxHP = forest.player.stats.val('hp');
      const damage = floatNumber(maxHP * 0.1); // 10% урона

      return {
        success: false,
        message: `Капкан сработал и нанёс тебе ${damage} урона!`,
        reward: {
          hp: -damage,
        },
      };
    }

    const ironAmount = MiscService.randInt(1, 2);
    return {
      success: true,
      message: `Ты разобрал капкан и получил ${ironAmount} железа!`,
      reward: {
        components: {
          iron: ironAmount,
        },
      },
    };
  }

  throw new Error(`Invalid action for old trap event: ${action}`);
};
