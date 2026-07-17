import type { GameResult, MonsterType } from '@fwo/shared';
import type { ForestService } from '@/arena/ForestService/ForestService';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { createForestGame } from '@/helpers/gameHelper';
import { FOREST_PHASE_DIFFICULTY } from './forestDifficulty';

export const startForestBattle = async (
  forest: ForestService,
  monsterType: MonsterType,
  reward: Partial<GameResult>,
) => {
  const phase = forest.getPhase();
  const lvl = forest.player.lvl;
  const budgetScale = FOREST_PHASE_DIFFICULTY[phase];

  const game = await createForestGame(
    forest.player,
    MonsterService.createByType(monsterType, lvl, budgetScale),
  );

  if (game) {
    await forest.startBattle(game, reward);
  }
};
