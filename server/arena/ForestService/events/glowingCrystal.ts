import { ForestEventAction, ItemComponent, MonsterType } from '@fwo/shared';
import type { ForestEventHandler } from './getEventHandler';
import { startForestBattle } from './startForestBattle';
import MiscService from '@/arena/MiscService';

export const handleGlowingCrystalEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      resolved: true,
      message: 'Ты прошёл мимо мерцающего кристалла.',
    };
  }

  if (action === ForestEventAction.TakeCrystal) {
    // Шанс элементаля
    const elementalChance = 0.9;
    if (Math.random() < elementalChance) {
      await startForestBattle(forest, MonsterType.Elemental, {
        components: {
          [ItemComponent.Arcanite]: MiscService.randInt(1, 2),
        },
      });
      return {
        success: false,
        resolved: false,
        message: 'Кристалл охранял элементаль!',
      };
    }

    const arcaniteAmount = 1; // Редкий ресурс, всегда 1
    return {
      success: true,
      resolved: true,
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
