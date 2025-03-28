import arena from '@/arena';
import { LogService } from '@/arena/LogService';
import { type ItemComponent, itemComponentName, reservedClanName } from '@fwo/shared';
import { bold } from '@/utils/formatString';
import { profsData } from '@/data/profs';

const MAX_MESSAGE_LENGTH = 2 ** 12;
const chatId = process.env.BOT_CHATID || -1001483444452;

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
  await broadcast(messageToSend);
}
/**
 * @param data - текст отправляемого сообщения
 * @param id - id чата
 */
export async function broadcast(data: string, id: number | string = chatId): Promise<void> {
  try {
    await arena.bot.telegram.sendMessage(id, data, { parse_mode: 'Markdown' });
  } catch (e) {
    console.log(`error: broadcast: ${e.message} for ${id}`);
  }
}

export const initGameChannel = () => {
  arena.mm.on('push', ({ id }) => {
    const character = arena.characters[id];
    if (character) {
      broadcast(
        `Игрок ${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) начал поиск игры!`,
      );
    }
  });

  arena.mm.on('pull', ({ id }) => {
    const character = arena.characters[id];
    if (character) {
      broadcast(
        `Игрок ${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) передумал...`,
      );
    }
  });

  arena.mm.on('start', (game) => {
    const log = new LogService(sendBattleLogMessages);
    broadcast('Игра начинается');

    game.on('startOrders', () => {
      broadcast('Пришло время делать заказы');
    });
    game.on('startRound', (e) => {
      broadcast(`⚡️ Раунд ${e.round} начинается ⚡`);
    });
    game.on('endRound', async (e) => {
      await log.sendBattleLog(e.log);
      if (e.dead.length) {
        await broadcast(`Погибшие в этом раунде: ${e.dead.map(({ nick }) => nick).join(', ')}`);
      }
    });

    game.on('end', (e) => {
      const getStatusString = (p: {
        exp: number;
        gold: number;
        nick: string;
        component?: ItemComponent;
      }) =>
        `\t👤 ${p.nick} получает ${p.exp}📖, ${p.gold}💰${p.component ? `, 1 ${itemComponentName[p.component]}` : ''}`;

      broadcast('Игра завершена');
      broadcast(`${bold`Статистика игры`}
  ${Object.entries(e.statistic).map(([clan, players]) => `${clan === reservedClanName ? 'Без клана' : clan}:\n${players?.map(getStatusString).join('\n')}`)}`);
    });
  });
};
