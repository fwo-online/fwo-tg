import {
  type GameResult,
  type ItemComponent,
  itemComponentName,
  monstersClanName,
  reservedClanName,
} from '@fwo/shared';
import { mapValues } from 'es-toolkit';
import { Types } from 'mongoose';
import arena from '@/arena';
import GameService, { type GameOptions } from '@/arena/GameService';
import { LadderService } from '@/arena/LadderService';
import { formatMessage } from '@/arena/LogService/utils';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { createSkeleton } from '@/arena/MonsterService/monsters/skeleton';
import { LadderRewardService, TowerRewardService } from '@/arena/RewardService';
import { RoundStatus } from '@/arena/RoundService';
import type { TowerService } from '@/arena/TowerService/TowerService';
import { broadcast as helperBroadcast, sendBattleLogMessages } from '@/helpers/channelHelper';
import { DonationHelper } from '@/helpers/donationHelper';
import { ClanModel } from '@/models/clan';
import { bold } from '@/utils/formatString';

const createBroadcast = (chat?: string) => {
  return (data: string) => helperBroadcast(data, chat);
};

export async function createGame(players: string[], options?: GameOptions, chat?: string) {
  const newGame = new GameService(players, options);
  const game = await newGame.createGame();

  if (!game) {
    return;
  }

  const broadcast = createBroadcast(chat);

  game.on('start', () => {
    broadcast('Игра начинается');
  });

  game.on('startOrders', () => {
    broadcast('Пришло время делать заказы');
  });

  game.on('startRound', ({ round, status }) => {
    broadcast(`⚡️ Раунд ${round} начинается ⚡`);
  });

  game.on('endRound', async ({ log, dead }) => {
    await sendBattleLogMessages(
      log.map((log) => formatMessage(log)),
      chat,
    );
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

const componentsToString = (components?: Partial<Record<ItemComponent, number>>) => {
  return Object.values(
    mapValues(
      components ?? {},
      (value, component) => `${value ?? 0} ${itemComponentName[component]}`,
    ),
  ).join(', ');
};

const resultToString = (result: GameResult) =>
  `\t${result.winner ? '🏆' : '👤'} ${result.player.name} получает ${result.exp}📖, ${result.gold}💰 ${componentsToString(result.components)} ${result.item?.info.name ?? ''}`;

export async function createLadderGame(players: string[]) {
  const game = await createGame(players);

  if (!game) {
    return;
  }

  const broadcast = createBroadcast();
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

export async function createTowerGame(tower: TowerService, isBoss: boolean) {
  const game = await createGame(tower.init);

  if (!game) {
    return;
  }

  const broadcast = createBroadcast();

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

export const createPracticeGame = async (player: string) => {
  const character = arena.characters[player];
  const game = await createGame(
    [player],
    { round: { timeouts: { [RoundStatus.INIT]: 2000, [RoundStatus.START_ROUND]: 2500 } } },
    character.owner,
  );

  if (!game) {
    return;
  }

  const skeleton = createSkeleton(character.lvl);

  game.addPlayers([skeleton]);

  const clan = new ClanModel({
    owner: new Types.ObjectId(),
    name: monstersClanName,
  });

  game.players.botPlayers.forEach((monster) => {
    monster.clan = clan;
    clan.players.push(arena.characters[monster.id].charObj);
  });

  game.on('startOrders', () => skeleton.ai.makeOrder(game));
};
