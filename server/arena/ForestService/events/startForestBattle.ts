import { ForestPhase, type GameResult, type MonsterType } from '@fwo/shared';
import type { ForestService } from '@/arena/ForestService/ForestService';
import { createForestGame } from '@/helpers/gameHelper';
import { MonsterService } from '@/arena/MonsterService/MonsterService';

const depthByPhase = {
  [ForestPhase.Edge]: 0,
  [ForestPhase.Wilds]: 2,
  [ForestPhase.Deep]: 4,
};

export const startForestBattle = async (
  forest: ForestService,
  monsterType: MonsterType,
  reward: Partial<GameResult>,
) => {
  const phase = forest.getPhase();
  const lvl = forest.player.lvl + depthByPhase[phase];

  const game = await createForestGame(forest.player, MonsterService.createByType(monsterType, lvl));

  if (game) {
    await forest.startBattle(game, reward);
  }
};
