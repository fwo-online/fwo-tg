import { ForestEventAction, ItemComponent, MonsterType } from '@fwo/shared';
import MiscService from '@/arena/MiscService';
import { resolveMonsterConfig } from '@/arena/MonsterService/balance/balance';
import { FOREST_PHASE_DIFFICULTY } from './forestDifficulty';
import type { ForestEventHandler } from './getEventHandler';
import { startForestBattle } from './startForestBattle';

export const handleWolfEvent: ForestEventHandler = async (action, forest) => {
  const leatherAmount = MiscService.randInt(1, forest.player.lvl);

  if (action === ForestEventAction.Sneak || action === ForestEventAction.PassBy) {
    // Проверка ловкости — согласована с реальным спавном волка
    const playerDex = forest.player.stats.val('attributes.dex');
    const phase = forest.getPhase();
    const { harks } = resolveMonsterConfig(
      MonsterType.Wolf,
      forest.player.lvl,
      FOREST_PHASE_DIFFICULTY[phase],
    );
    const wolfDex = harks.dex;

    const sneakChance = playerDex / (playerDex + wolfDex);

    if (forest.checkEventChance(sneakChance)) {
      await startForestBattle(forest, MonsterType.Wolf, {
        components: {
          [ItemComponent.Leather]: leatherAmount,
        },
      });

      return {
        success: false,
        resolved: false,
        message: 'Ты хрустнул веткой! Волк заметил тебя и атакует!',
      };
    } else {
      return {
        success: true,
        resolved: true,
        message: 'Ты бесшумно прокрался мимо волка!',
      };
    }
  }

  if (action === ForestEventAction.AttackWolf) {
    await startForestBattle(forest, MonsterType.Wolf, {
      components: {
        [ItemComponent.Leather]: leatherAmount,
      },
    });

    return {
      success: true,
      resolved: false,
      message: 'Ты решил атаковать волка!',
    };
  }

  throw new Error(`Invalid action for wolf event: ${action}`);
};
