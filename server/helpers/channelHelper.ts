import arena from '@/arena';
import {
  type GameResult,
  type ItemComponent,
  itemComponentName,
  reservedClanName,
} from '@fwo/shared';
import { bold } from '@/utils/formatString';
import { profsData } from '@/data/profs';
import { bot } from '@/bot';
import { DonationHelper } from '@/helpers/donationHelper';
import { formatMessage } from '@/arena/LogService/utils';
import type GameService from '@/arena/GameService';
import { mapValues } from 'es-toolkit';

const MAX_MESSAGE_LENGTH = 2 ** 12;
export const BOT_CHAT_ID = process.env.BOT_CHATID || -1001483444452;

export async function sendBattleLogMessages(messages: string[]) {
  let messageToSend = '';

  for await (const message of messages) {
    const nextMessageToSend = messageToSend.concat('\n\n', message);

    if (messageToSend.length > MAX_MESSAGE_LENGTH) {
      await broadcast(messageToSend);
      messageToSend = message;
    } else {
      messageToSend = nextMessageToSend;
    }
  }

  if (!messageToSend.trim().length) {
    return;
  }

  await broadcast(messageToSend);
}
/**
 * @param data - текст отправляемого сообщения
 * @param id - id чата
 */
export async function broadcast(data: string, id: number | string = BOT_CHAT_ID): Promise<void> {
  try {
    await bot.api.sendMessage(id, data, { parse_mode: 'Markdown' });
  } catch (e) {
    console.error(`error: broadcast: ${e.message} for ${id}`);
  }
}

const componentsToString = (components?: Partial<Record<ItemComponent, number>>) => {
  Object.values(
    mapValues(
      components ?? {},
      (value, component) => `${value ?? 0} ${itemComponentName[component]}`,
    ),
  ).join(', ');
};

const resultToString = (result: GameResult) => {
  `\t${result.winner ? '🏆' : '👤'} ${result.player.name} получает ${result.exp}📖, ${result.gold}💰 ${componentsToString(result.components)} ${result.item?.info.name ?? ''}`;
};

export const initGameListeners = (game: GameService) => {
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

  game.on('end', async (e) => {
    const resultsByClan = Object.groupBy(
      e.rewards,
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

    if (DonationHelper.shouldAnnounce()) {
      const donators = await DonationHelper.getDonators();

      if (donators.length) {
        await broadcast(`${bold('Поддержавшие проект в этом месяце:')}
${donators.map((donator) => `⭐ ${bold(donator.nickname)}`).join('\n')}
          
Спасибо за поддержку!`);
        DonationHelper.resetLastAnnouncement();
      }
    }
  });
};

export const initGameChannel = async () => {
  arena.mm.on('push', ({ id }) => {
    const character = arena.characters[id];
    if (character) {
      broadcast(
        `Игрок ${character.clan ? `\\[${character.clan.name}\] ` : ''}${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) начал поиск игры!`,
      );
    }
  });

  arena.mm.on('pull', ({ id }) => {
    const character = arena.characters[id];
    if (character) {
      broadcast(
        `Игрок ${character.clan ? `\\[${character.clan.name}\] ` : ''}${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) передумал...`,
      );
    }
  });

  arena.mm.prependListener('start', initGameListeners);
};
