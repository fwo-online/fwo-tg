import {
  componentsToString,
  type GameResult,
  MonsterType,
  monstersClanName,
  reservedClanName,
} from '@fwo/shared';
import { Types } from 'mongoose';
import { createGame as createGameApi } from '@/api/game';
import arena from '@/arena';
import GameService, { type GameOptions } from '@/arena/GameService';
import { LadderService } from '@/arena/LadderService';
import { formatDead, formatMessage } from '@/arena/LogService/utils';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import type { Player } from '@/arena/PlayersService';
import {
  ForestRewardService,
  LadderRewardService,
  PracticeRewardService,
  TowerRewardService,
} from '@/arena/RewardService';
import { RoundStatus } from '@/arena/RoundService';
import type { TowerService } from '@/arena/TowerService/TowerService';
import { sendLevelUpCongratulations } from '@/bot';
import {
  BOT_CHAT_ID,
  broadcast,
  broadcastLevelUp,
  closeTopic,
  createTopic,
} from '@/helpers/channelHelper';
import { DonationHelper } from '@/helpers/donationHelper';
import { ClanModel } from '@/models/clan';
import { NotificationService } from '@/services/NotificationService';
import { bold } from '@/utils/formatString';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BroadcastScope = 'global' | 'clan';

interface ChannelConfig {
  chat: string | number;
  thread?: number;
}

// ─── Broadcast ───────────────────────────────────────────────────────────────

class GameBroadcast {
  private mainChannels: ChannelConfig[];
  private clanChannels: ChannelConfig[];

  private constructor(mainChannels: ChannelConfig[], clanChannels: ChannelConfig[]) {
    this.mainChannels = mainChannels;
    this.clanChannels = clanChannels;
  }

  /**
   * Создаёт Broadcast для игры.
   * @param options.chat — Основной чат (личный ДМ или undefined для общего канала)
   * @param options.gameId — ID игры (для создания треда)
   * @param options.clanChannels — Telegram-ID каналов кланов участников
   */
  static async create(options: {
    chat?: string | number;
    gameId?: number;
    clanChannels?: number[];
  }): Promise<GameBroadcast> {
    const mainChannels: ChannelConfig[] = [];
    const clanChannels: ChannelConfig[] = [];

    if (options.clanChannels) {
      for (const ch of options.clanChannels) {
        clanChannels.push({ chat: ch });
      }
    }

    if (!options.chat) {
      const thread = await createTopic(`Game #${options.gameId}`);
      mainChannels.push({ chat: BOT_CHAT_ID, thread });
    } else {
      mainChannels.push({ chat: options.chat });
    }

    return new GameBroadcast(mainChannels, clanChannels);
  }

  async close(): Promise<void> {
    if (this.mainChannels[0]?.thread) {
      await closeTopic(this.mainChannels[0].chat, this.mainChannels[0].thread);
    }
  }

  async send(data: string | string[], scope: BroadcastScope = 'global'): Promise<void> {
    const targets =
      scope === 'clan' ? this.clanChannels : [...this.mainChannels, ...this.clanChannels];

    for (const channel of targets) {
      await broadcast(data, channel.chat, channel.thread);
    }
  }
}

// ─── Утилиты ─────────────────────────────────────────────────────────────────

/** Собирает уникальные клановые каналы участников игры */
function getClanChannelsFromPlayers(playerIds: string[]): number[] {
  const channels = new Set<number>();
  for (const id of playerIds) {
    const character = arena.characters[id];
    const channel = character?.charObj.clan?.channel;
    if (channel) {
      channels.add(channel);
    }
  }
  return [...channels];
}

/** Форматирование строки результатов одного игрока */
const formatResult = (result: GameResult): string =>
  `\t${result.winner ? '🏆' : '👤'} ${result.player.name} получает ${[
    `${result.exp}📖`,
    `${result.gold}💰`,
    `${result.components ? `${componentsToString(result.components)}` : ''}`,
    `${result.item ? result.item.info.name : ''}`,
  ]
    .filter(Boolean)
    .join(', ')}`;

// ─── Game events ─────────────────────────────────────────────────────────────

/** Подписка на события игры: уведомления, логи, донаты */
function setupGameEvents(game: GameService, gameBroadcast: GameBroadcast): void {
  game.on('start', async () => {
    await gameBroadcast.send('Игра начинается');

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
    void gameBroadcast.send('Пришло время делать заказы');
  });

  game.on('startRound', ({ round }) => {
    void gameBroadcast.send(`⚡️ Раунд ${round} начинается ⚡`);
  });

  game.on('endRound', async ({ log, dead }) => {
    await gameBroadcast.send(log.map((log) => formatMessage(log)));
    if (dead.length) {
      await gameBroadcast.send(formatDead(dead));
    }
  });

  game.on('kick', ({ player }) => {
    void gameBroadcast.send(`Игрок ${bold(player.nick)} был выброшен из игры`);
  });

  game.on('preKick', async ({ player }) => {
    const character = arena.characters[player.id];
    if (character) {
      await NotificationService.sendAfkWarningNotification(character, game.info.id);
    }
  });

  game.on('end', async ({ results }) => {
    await sendGameResults(gameBroadcast, results);
    await updatePlayerQuests(results);
    await sendLevelUpNotifications(results);
    await scheduleDonationAnnouncement(gameBroadcast);
  });
}

/** Отправка результатов игры */
async function sendGameResults(broadcast: GameBroadcast, results: GameResult[]): Promise<void> {
  const resultsByClan = Object.groupBy(
    results,
    ({ player }) => player.clan?.name ?? reservedClanName,
  );

  await broadcast.send('Игра завершена');
  await broadcast.send(`${bold`Статистика игры`}
${Object.entries(resultsByClan)
  .map(
    ([clan, players]) =>
      `${bold(clan === reservedClanName ? 'Без клана' : clan)}:\n${players?.map(formatResult).join('\n')}`,
  )
  .join('\n\n')}`);
}

/** Обновление прогресса квестов */
async function updatePlayerQuests(results: GameResult[]): Promise<void> {
  try {
    const promises = results.map((result) => {
      const character = arena.characters[result.player.id];
      return character.quests.updateQuestProgress(result);
    });
    await Promise.all(promises);
  } catch (e) {
    console.error('Failed to updateQuestProgress:', e);
  }
}

/** Отправка поздравлений с новым уровнем */
async function sendLevelUpNotifications(results: GameResult[]): Promise<void> {
  const levelUpPromises = results
    .filter((result) => result.levelUp)
    .map(async (result) => {
      if (!result.levelUp) return;

      const { newLevel, freePoints } = result.levelUp;

      await sendLevelUpCongratulations(
        result.player.owner,
        result.player.name,
        newLevel,
        freePoints,
      ).catch((e) => console.error('Failed to send personal level up message:', e));

      await broadcastLevelUp(
        result.player.name,
        newLevel,
        result.player.class,
        result.player.clan?.name,
      ).catch((e) => console.error('Failed to broadcast level up:', e));
    });

  await Promise.all(levelUpPromises);
}

/** Отложенная отправка сообщения о донатерах */
async function scheduleDonationAnnouncement(broadcast: GameBroadcast): Promise<void> {
  setTimeout(async () => {
    if (!DonationHelper.shouldAnnounce()) return;

    const donators = await DonationHelper.getDonators();
    if (!donators.length) return;

    await broadcast.send(`${bold('Поддержавшие проект в этом месяце:')}
${donators.map((donator) => `⭐ ${bold(donator.nickname)}`).join('\n')}

Спасибо за поддержку!`);
    DonationHelper.resetLastAnnouncement();

    await broadcast.close();
  }, 10000);
}

// ─── Game factories ──────────────────────────────────────────────────────────

/**
 * Создаёт игру и настраивает общие игровые события (логи, уведомления, донаты).
 *
 * @param players — ID персонажей-участников
 * @param options — Настройки игры (таймауты и т.д.)
 * @param chat — Личный чат инициатора (если игра приватная)
 * @param clanChannels — Telegram-ID каналов кланов участников
 */
export async function createGame(
  players: string[],
  options?: GameOptions,
  chat?: string,
  clanChannels?: number[],
) {
  const gameDoc = await createGameApi(players);
  const game = new GameService(players, options);
  const gameBroadcast = await GameBroadcast.create({ chat, gameId: gameDoc.gameId, clanChannels });

  setupGameEvents(game, gameBroadcast);

  return game.createGame(gameDoc);
}

/** Создание рейтинговой игры (Ladder) */
export async function createLadderGame(players: string[]) {
  const clanChannels = getClanChannelsFromPlayers(players);
  const game = await createGame(players, undefined, undefined, clanChannels);

  if (!game) return;

  const reward = new LadderRewardService(game);
  const ladder = new LadderService(game);

  game.on('beforeEnd', async ({ draw }) => {
    const rewards = await reward.giveRewards(draw);
    await ladder.saveGameStats(rewards);
    game.end(rewards);
  });

  game.on('end', () => {
    arena.mm.reset('ladder');
  });

  return game;
}

/** Создание боя в башне */
export async function createTowerGame(tower: TowerService, isBoss: boolean) {
  const clanChannels = getClanChannelsFromPlayers(tower.init);
  const game = await createGame(tower.init, undefined, undefined, clanChannels);

  if (!game) return;

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

/** Создание тренировочного боя */
export async function createPracticeGame(player: string) {
  const character = arena.characters[player];
  const clanChannels = character.charObj.clan?.channel
    ? [character.charObj.clan.channel]
    : undefined;

  const game = await createGame(
    [player],
    { round: { timeouts: { [RoundStatus.INIT]: 2000, [RoundStatus.START_ROUND]: 5000 } } },
    character.owner,
    clanChannels,
  );

  if (!game) return;

  const skeleton = MonsterService.createByType(MonsterType.Skeleton, character.lvl);
  game.addPlayers([skeleton]);

  const monsterClan = new ClanModel({
    owner: new Types.ObjectId(),
    name: monstersClanName,
  });

  game.players.botPlayers.forEach((monster) => {
    monster.clan = monsterClan;
    monsterClan.players.push(arena.characters[monster.id].charObj);
  });

  game.on('startOrders', () => skeleton.ai.makeOrder(game));

  const reward = new PracticeRewardService(game);

  game.on('beforeEnd', async ({ draw }) => {
    const rewards = await reward.giveRewards(draw);
    game.end(rewards);
  });
}

/** Создание боя в лесу */
export async function createForestGame(player: Player, enemy: Player) {
  const clanChannels = player.clan?.channel ? [player.clan.channel] : undefined;

  const game = await createGame(
    [],
    {
      round: { timeouts: { [RoundStatus.INIT]: 1000, [RoundStatus.START_ROUND]: 3000 } },
    },
    enemy.isBot ? player.owner : undefined,
    clanChannels,
  );

  if (!game) return;

  game.addPlayers([player, enemy]);

  const monsterClan = new ClanModel({
    owner: new Types.ObjectId(),
    name: monstersClanName,
  });

  game.players.botPlayers.forEach((bot) => {
    bot.clan = monsterClan;
    monsterClan.players.push(arena.characters[bot.id].charObj);
  });

  game.on('startOrders', () => {
    game.players.aliveBotPlayers.filter(MonsterService.isMonster).forEach((bot) => {
      bot.ai.makeOrder(game);
    });
  });

  const reward = new ForestRewardService(game);

  game.on('beforeEnd', async ({ draw }) => {
    const rewards = await reward.giveRewards(draw);
    game.end(rewards);
  });

  return game;
}
