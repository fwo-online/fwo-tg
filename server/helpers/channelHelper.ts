import arena from '@/arena';
import { bot } from '@/bot';
import { profsData } from '@/data/profs';
import { bold, brackets } from '@/utils/formatString';

const MAX_MESSAGE_LENGTH = 2 ** 12;
export const BOT_CHAT_ID = process.env.BOT_CHATID || -1001483444452;

export async function sendBattleLogMessages(messages: string[], id: number | string = BOT_CHAT_ID) {
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

  await broadcast(messageToSend, id);
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

/**
 * Отправка поздравления с новым уровнем в канал
 * @param nickname - Имя персонажа
 * @param newLevel - Новый уровень
 * @param prof - Профессия персонажа
 * @param clanName - Название клана (опционально)
 */
export const broadcastLevelUp = async (
  nickname: string,
  newLevel: number,
  prof: string,
  clanName?: string
) => {
  const profIcon = profsData[prof]?.icon || '⚔️';
  const clanPrefix = clanName ? `${brackets(clanName)} ` : '';

  await broadcast(
    `🎉 Игрок ${clanPrefix}${bold(nickname)} достиг ${bold(`${profIcon}${newLevel} уровня`)}! Поздравляем!`
  );
};

export const initGameChannel = async () => {
  arena.mm.on('push', ({ id, queue }) => {
    const character = arena.characters[id];
    if (!character) {
      console.error('mm push error:::', id);
      return;
    }

    if (queue === 'ladder') {
      broadcast(
        `Игрок ${character.clan ? `${brackets(character.clan.name)} ` : ''}${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) ищет игру!`,
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
        `Игрок ${character.clan ? `${brackets(character.clan.name)} ` : ''}${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) передумал...`,
      );
    }

    if (queue === 'tower') {
      broadcast(
        `Игрок ${bold(character.nickname)} (${profsData[character.prof].icon}${character.lvl}) передумал...`,
      );
    }
  });

  arena.mm.on('timeout', ({ id }) => {
    const character = arena.characters[id];
    if (!character) {
      console.error('mm timeout error:::', id);
      return;
    }

    broadcast(`${bold(character.nickname)} пытался найти себе противника, но никто не захотел с ним сражаться.`);
  });
};
