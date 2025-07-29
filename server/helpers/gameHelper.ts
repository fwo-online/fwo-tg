import {
  type GameResult,
  type ItemComponent,
  itemComponentName,
  reservedClanName,
} from '@fwo/shared';
import { mapValues } from 'es-toolkit';
import arena from '@/arena';
import GameService from '@/arena/GameService';
import { LadderService } from '@/arena/LadderService';
import { formatMessage } from '@/arena/LogService/utils';
import { LadderRewardService } from '@/arena/RewardService';
import { broadcast, sendBattleLogMessages } from '@/helpers/channelHelper';
import { DonationHelper } from '@/helpers/donationHelper';
import { bold } from '@/utils/formatString';

export async function createGame(players: string[]) {
  const newGame = new GameService(players);
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

  game.on('end', async () => {
    setTimeout(async () => {
      if (DonationHelper.shouldAnnounce()) {
        const donators = await DonationHelper.getDonators();

        if (donators.length) {
          await broadcast(`${bold('Поддержавшие проект в этом месяце:')}
  ${donators.map((donator) => `⭐ ${bold(donator.nickname)}`).join('\n')}

  Спасибо за поддержку!`);
          DonationHelper.resetLastAnnouncement();
        }
      }
    }, 10000);
  });

  return game;
}

export const componentsToString = (components?: Partial<Record<ItemComponent, number>>) => {
  return Object.values(
    mapValues(
      components ?? {},
      (value, component) => `${value ?? 0} ${itemComponentName[component]}`,
    ),
  ).join(', ');
};

export const resultToString = (result: GameResult) =>
  `\t${result.winner ? '🏆' : '👤'} ${result.player.name} получает ${result.exp}📖, ${result.gold}💰 ${componentsToString(result.components)} ${result.item?.info.name ?? ''}`;

export async function createLadderGame(players: string[]) {
  const game = await createGame(players);

  if (!game) {
    return;
  }

  const reward = new LadderRewardService(game);
  const ladder = new LadderService(game);

  game.on('end', async ({ draw }) => {
    arena.mm.reset('ladder');

    const rewards = await reward.giveRewards(draw);
    const resultsByClan = Object.groupBy(
      rewards,
      ({ player }) => player.clan?.name || reservedClanName,
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

  await ladder.saveGameStats();
  return game;
}
