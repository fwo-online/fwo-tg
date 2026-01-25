import {
  componentsToString,
  type GameResult,
  monstersClanName,
  reservedClanName,
} from '@fwo/shared';
import { Types } from 'mongoose';
import arena from '@/arena';
import GameService, { type GameOptions } from '@/arena/GameService';
import { LadderService } from '@/arena/LadderService';
import { formatMessage } from '@/arena/LogService/utils';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { createSkeleton } from '@/arena/MonsterService/monsters/skeleton';
import {
  LadderRewardService,
  PracticeRewardService,
  TowerRewardService,
} from '@/arena/RewardService';
import { RoundStatus } from '@/arena/RoundService';
import type { TowerService } from '@/arena/TowerService/TowerService';
import { sendLevelUpCongratulations } from '@/bot';
import {
  broadcastLevelUp,
  broadcast as helperBroadcast,
  sendBattleLogMessages,
} from '@/helpers/channelHelper';
import { DonationHelper } from '@/helpers/donationHelper';
import { ClanModel } from '@/models/clan';
import { NotificationService } from '@/services/NotificationService';
import { bold } from '@/utils/formatString';

const createBroadcast = (chat?: string) => {
  return (data: string) => helperBroadcast(data, chat);
};

export async function createGame(players: string[], options?: GameOptions, chat?: string) {
  const game = new GameService(players, options);
  const broadcast = createBroadcast(chat);

  game.on('start', async () => {
    broadcast('Игра начинается');

    // Отправка уведомлений отключенным игрокам
    await Promise.all(
      game.players.nonBotPlayers.map(async (player) => {
        const character = arena.characters[player.id];
        if (character) {
          await NotificationService.sendGameStartNotification(character, game.info.id);
        }
      }),
    ).catch((e) => console.error('[GameHelper] Failed to send game start notifications:', e));
  });

  game.on('startOrders', () => {
    broadcast('Пришло время делать заказы');
  });

  game.on('startRound', ({ round }) => {
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

  game.on('preKick', async ({ player }) => {
    const character = arena.characters[player.id];
    if (character) {
      await NotificationService.sendAfkWarningNotification(character, game.info.id);
    }
  });

  game.on('end', async ({ results }) => {
    const resultsByClan = Object.groupBy(
      results,
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

    // Отправка поздравлений с новым уровнем
    const levelUpPromises = results
      .filter((result) => result.levelUp)
      .map(async (result) => {
        if (!result.levelUp) return;

        const { newLevel, freePoints } = result.levelUp;

        // Личное сообщение
        await sendLevelUpCongratulations(
          result.player.owner,
          result.player.name,
          newLevel,
          freePoints,
        ).catch((e) => console.error('Failed to send personal level up message:', e));

        // Сообщение в канал
        await broadcastLevelUp(
          result.player.name,
          newLevel,
          result.player.class,
          result.player.clan?.name,
        ).catch((e) => console.error('Failed to broadcast level up:', e));
      });

    await Promise.all(levelUpPromises);

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

  return game.createGame();
}

const resultToString = (result: GameResult) =>
  `\t${result.winner ? '🏆' : '👤'} ${result.player.name} получает ${[
    `${result.exp}📖`,
    `${result.gold}💰`,
    `${result.components ? `${componentsToString(result.components)}` : ''}`,
    `${result.item ? result.item.info.name : ''}`,
  ]
    .filter(Boolean)
    .join(', ')}`;

export async function createLadderGame(players: string[]) {
  const game = await createGame(players);

  if (!game) {
    return;
  }

  const reward = new LadderRewardService(game);
  const ladder = new LadderService(game);

  game.on('beforeEnd', async ({ draw }) => {
    const rewards = await reward.giveRewards(draw);
    await ladder.saveGameStats();

    game.end(rewards);
  });

  game.on('end', () => {
    arena.mm.reset('ladder');
  });

  return game;
}

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

  game.on('beforeEnd', async ({ draw }) => {
    const rewards = await reward.giveRewards(draw);

    game.end(rewards);
  });

  return game;
}

export const createPracticeGame = async (player: string) => {
  const character = arena.characters[player];
  const game = await createGame(
    [player],
    { round: { timeouts: { [RoundStatus.INIT]: 2000, [RoundStatus.START_ROUND]: 5000 } } },
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

  const reward = new PracticeRewardService(game);

  game.on('beforeEnd', async ({ draw }) => {
    const rewards = await reward.giveRewards(draw);
    game.end(rewards);
  });
};
