import arena from '@/arena';
import { bot } from '@/bot';
import { profsData } from '@/data/profs';
import { bold, brackets } from '@/utils/formatString';

const MAX_MESSAGE_LENGTH = 2 ** 12;
export const BOT_CHAT_ID = process.env.BOT_CHATID || -1001483444452;

function* chunkMessages(
  messages: string[],
  maxLength: number = MAX_MESSAGE_LENGTH,
): Generator<string> {
  let current = '';

  for (const message of messages) {
    const candidate = current ? `${current}\n\n${message}` : message;

    if (candidate.length > maxLength) {
      if (current) {
        yield current;
      }
      current = message;
    } else {
      current = candidate;
    }
  }

  if (current.trim()) {
    yield current;
  }
}

/**
 * @param data - текст отправляемого сообщения
 * @param id - id чата
 */
export async function broadcast(
  data: string | string[],
  chat: number | string = BOT_CHAT_ID,
  message_thread_id?: number,
): Promise<void> {
  try {
    if (Array.isArray(data)) {
      for (const chunk of chunkMessages(data)) {
        await bot.api.sendMessage(chat, chunk, { parse_mode: 'Markdown', message_thread_id });
      }
    } else {
      await bot.api.sendMessage(chat, data, { parse_mode: 'Markdown', message_thread_id });
    }
  } catch (e) {
    console.error(`error: broadcast: ${e.message} for ${chat}`);
  }
}

export async function createTopic(name: string) {
  const topic = await bot.api.createForumTopic(BOT_CHAT_ID, name);

  return topic.message_thread_id;
}

export async function closeTopic(chat: string | number = BOT_CHAT_ID, thread: number) {
  return bot.api.closeForumTopic(chat, thread);
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
  clanName?: string,
) => {
  const profIcon = profsData[prof]?.icon || '⚔️';
  const clanPrefix = clanName ? `${brackets(clanName)} ` : '';

  await broadcast(
    `🎉 Игрок ${clanPrefix}${bold(nickname)} достиг ${bold(`${profIcon}${newLevel} уровня`)}! Поздравляем!`,
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

    broadcast(
      `${bold(character.nickname)} пытался найти себе противника, но никто не захотел с ним сражаться.`,
    );
  });
};
