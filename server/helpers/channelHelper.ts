import arena from '@/arena';
import { bot } from '@/bot';
import { profsData } from '@/data/profs';
import { bold } from '@/utils/formatString';

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
  arena.mm.on('push', ({ id, queue }) => {
    const character = arena.characters[id];
    if (!character) {
      console.error('mm push error:::', id);
      return;
    }

    if (queue === 'ladder') {
      broadcast(
        `Игрок ${character.clan ? `\\[${character.clan.name}\] ` : ''}${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) ищет игру!`,
      );
    }

    if (queue === 'tower') {
      broadcast(
        `Игрок ${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) планирует поход в башню!`,
      );
    }
  });

  arena.mm.on('pull', ({ id, queue }) => {
    const character = arena.characters[id];
    if (!character) {
      console.error('mm pull error:::', id);
      return;
    }

    if (queue === 'ladder') {
      broadcast(
        `Игрок ${character.clan ? `\\[${character.clan.name}\] ` : ''}${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) передумал...`,
      );
    }

    if (queue === 'tower') {
      broadcast(
        `Игрок ${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) передумал...`,
      );
    }
  });
};
