import GameService from '@/arena/GameService';
import { LadderService } from '@/arena/LadderService';
import { formatMessage } from '@/arena/LogService/utils';
import {
  LadderRewardService,
  type RewardServiceFactory,
  TowerRewardService,
} from '@/arena/RewardService';
import { broadcast, sendBattleLogMessages } from '@/helpers/channelHelper';
import { bold } from '@/utils/formatString';

export async function createGame(players: string[], reward: RewardServiceFactory) {
  const newGame = new GameService(players, reward);
  const game = await newGame.createGame();

  if (!game) {
    return;
  }

  game.on('start', () => {
    broadcast('Игра начинается');
  });

  game.on('startOrders', () => {
    broadcast('Пришло время делать заказы');
  });

  game.on('startRound', ({ round }) => {
    broadcast(`⚡️ Раунд ${round} начинается ⚡`);
  });

  game.on('endRound', async ({ log, dead }) => {
    await sendBattleLogMessages(log.map((log) => formatMessage(log)));
    if (dead.length) {
      await broadcast(`Погибшие в этом раунде: ${dead.map(({ nick }) => nick).join(', ')}`);
    }
  });

  game.on('kick', ({ player }) => {
    broadcast(`Игрок ${bold(player.nick)} был выброшен из игры`);
  });

  return game;
}

export async function createLadderGame(players: string[]) {
  const game = await createGame(players, (game) => new LadderRewardService(game));

  if (!game) {
    return;
  }

  const ladder = new LadderService(game);

  game.on('end', async () => {
    await ladder.saveGameStats();
  });
}

export async function createTowerGame(players: string[], isBoss: boolean) {
  const game = await createGame(players, (game) => new TowerRewardService(game, isBoss));

  if (!game) {
    return;
  }

  return game;
}
