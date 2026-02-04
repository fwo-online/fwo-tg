import { MonsterType } from '@fwo/shared';
import type { ForestService } from '@/arena/ForestService/ForestService';
import { createForestGame } from '@/helpers/gameHelper';
import { MonsterService } from '@/arena/MonsterService/MonsterService';

export const startForestBattle = async (forest: ForestService, monsterType: MonsterType) => {
  const game = await createForestGame(
    forest.player,
    MonsterService.createByType(monsterType, forest.player.lvl),
  );

  if (game) {
    forest.startBattle(game);
  }
};
