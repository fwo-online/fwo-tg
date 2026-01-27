import { ForestEventAction, MonsterType } from '@fwo/shared';
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
    const elementalChance = 0.5;
    if (Math.random() < elementalChance) {
      return {
        success: false,
        message: 'Кристалл охранял элементаль!',
        startBattle: true,
        monsterType: MonsterType.Elemental,
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
