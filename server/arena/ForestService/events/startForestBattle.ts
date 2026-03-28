import type { GameResult, MonsterType } from '@fwo/shared';
import type { ForestService } from '@/arena/ForestService/ForestService';
import { createForestGame } from '@/helpers/gameHelper';
import { MonsterService } from '@/arena/MonsterService/MonsterService';

export const startForestBattle = async (
  forest: ForestService,
  monsterType: MonsterType,
  reward?: Partial<GameResult>,
) => {
  const game = await createForestGame(
    forest.player,
    MonsterService.createByType(monsterType, forest.player.lvl),
    reward ?? {},
  );

  if (game) {
    await forest.startBattle(game);
  }
};
