import { ForestEventAction } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import { floatNumber } from '@/utils/floatNumber';
import type { ForestEventHandler } from './getEventHandler';

export const handleOldTrapEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      resolved: true,
      message: 'Ты осторожно обошёл старый капкан.',
    };
  }

  if (action === ForestEventAction.DisarmTrap) {
    // Шанс получить урон или встретить паука
    if (forest.checkEventChance(0.3)) {
      const maxHP = forest.player.stats.val('hp');
      const damage = floatNumber(maxHP * 0.15); // 15% урона

      return {
        success: false,
        resolved: true,
        message: `Капкан сработал и нанёс тебе ${damage} урона!`,
        reward: {
          hp: -damage,
        },
      };
    }

    const ironAmount = MiscService.randInt(1, 2);
    return {
      success: true,
      resolved: true,
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
