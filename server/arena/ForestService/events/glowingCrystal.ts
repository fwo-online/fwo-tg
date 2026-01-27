import { ForestEventAction } from '@fwo/shared';
import type { ForestEventHandler } from './types';

export const handleGlowingCrystalEvent: ForestEventHandler = async (action) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      message: 'Ты прошёл мимо мерцающего кристалла.',
    };
  }

  if (action === ForestEventAction.TakeCrystal) {
    // Шанс элементаля
    const elementalChance = 0.15; // 15% шанс
    if (Math.random() < elementalChance) {
      return {
        success: false,
        message: 'Кристалл охранял элементаль! (TODO: бой с элементалем)',
        // startBattle: true,
      };
    }

    const arcaniteAmount = 1; // Редкий ресурс, всегда 1
    return {
      success: true,
      message: `Ты забрал кристалл и получил ${arcaniteAmount} арканит!`,
      reward: {
        components: {
          arcanite: arcaniteAmount,
        },
      },
    };
  }

  throw new Error(`Invalid action for glowing crystal event: ${action}`);
};
