import arena from '@/arena';
import { CharacterService } from '@/arena/CharacterService';
import GameService from '@/arena/GameService';
import { LadderService } from '@/arena/LadderService';
import { formatMessage } from '@/arena/LogService/utils';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { LadderRewardService, TowerRewardService } from '@/arena/RewardService';
import { TowerService } from '@/arena/TowerService/TowerService';
import { broadcast, sendBattleLogMessages } from '@/helpers/channelHelper';
import { DonationHelper } from '@/helpers/donationHelper';
import { bold } from '@/utils/formatString';
import {
  type GameResult,
  type ItemComponent,
  itemComponentName,
  reservedClanName,
} from '@fwo/shared';
import { mapValues } from 'es-toolkit';

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

export async function createTower(players: string[]) {
  const newTower = new TowerService(players, 5);
  const tower = await newTower.createTower();
  tower.on('end', async () => {
    arena.mm.reset('tower');
    const date = new Date();
    await Promise.all(
      players.map(async (id) => {
        const char = await CharacterService.getCharacterById(id);
        char.lastTower = date;
        await char.saveToDb();
      }),
    );

    broadcast('Башня завершена');
  });

  tower.on('battleStart', async () => {
    await broadcast('Монстры нападают на путников!');
  });

  tower.on('battleEnd', async (_, win) => {
    if (win) {
      await broadcast('Монстры побеждён!');
    } else {
      await broadcast('Монстры победил путников!');
    }
  });

  return tower;
}

export async function createTowerGame(tower: TowerService, isBoss: boolean) {
  /** @todo надо как-то нормально тут сделать */
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

    console.log(`${bold`Статистика игры`}
${Object.entries(resultsByClan)
  .map(([clan, players]) => {
    console.log(players);
    return `${bold(clan === reservedClanName ? 'Без клана' : clan)}:\n${players?.map(resultToString).join('\n')}`;
  })
  .join('\n')}`);

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
