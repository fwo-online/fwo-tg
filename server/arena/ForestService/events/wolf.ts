import { ForestEventAction, ItemComponent, MonsterType } from '@fwo/shared';
import type { ForestEventHandler } from './getEventHandler';
import { startForestBattle } from './startForestBattle';
import MiscService from '@/arena/MiscService';

export const handleWolfEvent: ForestEventHandler = async (action, forest) => {
  if (action === ForestEventAction.Sneak) {
    // Проверка ловкости
    const playerDex = forest.player.stats.val('attributes.dex');
    const wolfLevel = forest.player.lvl;
    const wolfDex = Math.round(wolfLevel * 1 + 10); // Формула из wolf.ts

    const sneakChance = playerDex / (playerDex + wolfDex);
    const success = Math.random() < sneakChance;

    if (success) {
      return {
        success: true,
        resolved: true,
        message: 'Ты бесшумно прокрался мимо волка!',
      };
    } else {
      await startForestBattle(forest, MonsterType.Wolf, {
        components: { [ItemComponent.Leather]: MiscService.randInt(1, forest.player.lvl) },
      });

      return {
        success: false,
        resolved: false,
        message: 'Ты хрустнул веткой! Волк заметил тебя и атакует!',
      };
    }
  }

  if (action === ForestEventAction.AttackWolf) {
    await startForestBattle(forest, MonsterType.Wolf);

    return {
      success: true,
      resolved: false,
      message: 'Ты решил атаковать волка!',
    };
  }

  throw new Error(`Invalid action for wolf event: ${action}`);
};
