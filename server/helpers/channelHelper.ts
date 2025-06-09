import arena from '@/arena';
import { bold } from '@/utils/formatString';
import { profsData } from '@/data/profs';
import { bot } from '@/bot';

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
};
