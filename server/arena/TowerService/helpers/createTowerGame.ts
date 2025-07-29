import { reservedClanName } from '@fwo/shared';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { TowerRewardService } from '@/arena/RewardService';
import type { TowerService } from '@/arena/TowerService';
import { broadcast } from '@/helpers/channelHelper';
import { createGame, resultToString } from '@/helpers/gameHelper';
import { bold } from '@/utils/formatString';

export async function createTowerGame(tower: TowerService, isBoss: boolean) {
  const game = await createGame(tower.init);

  if (!game) {
    return;
  }

  game.on('startOrders', () => {
    game.players.aliveBotPlayers.filter(MonsterService.isMonster).forEach((bot) => {
      bot.ai.makeOrder(game);
    });
  });

  const reward = new TowerRewardService(game, tower, isBoss);

  game.on('end', async ({ draw }) => {
    const rewards = await reward.giveRewards(draw);
    const resultsByClan = Object.groupBy(
      rewards,
      ({ player }) => player.clan?.name ?? reservedClanName,
    );

    await broadcast('Игра завершена');
    await broadcast(`${bold`Статистика игры`}
${Object.entries(resultsByClan)
  .map(
    ([clan, players]) =>
      `${bold(clan === reservedClanName ? 'Без клана' : clan)}:\n${players?.map(resultToString).join('\n')}`,
  )
  .join('\n\n')}`);
  });

  return game;
}
