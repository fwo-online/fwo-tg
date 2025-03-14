import { Markup } from 'telegraf';
import arena from '../arena';
import type { Player } from '../arena/PlayersService';
import { Profs } from '../data';

const MAX_MESSAGE_LENGTH = 2 ** 12;
const chatId = process.env.BOT_CHATID || -1001483444452;

const messages: Record<number, number> = {};

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

/**
 * Отправляет статистику и кнопку выхода в лобби
 * @param player
 */
export async function sendExitButton(player: Player): Promise<void> {
  try {
    const { exp, gold } = player.stats.collect;
    const character = arena.characters[player.id];
    const { autoreg, nickname, lvl, prof, clan, expLimitToday, expEarnedToday } = character;

    let expMessage = `${exp}`;
    if (expEarnedToday >= expLimitToday) {
      expMessage += ' (достигнут лимит опыта на сегодня)';
    } else {
      expMessage += ` (доступно ещё 📖 ${expLimitToday - expEarnedToday} сегодня)`;
    }

    const message = await arena.bot.telegram.sendMessage(
      player.owner,
      `Награда за бой:
  📖 ${expMessage} (${character.exp}/${character.nextLvlExp})
  💰 ${gold} (${character.gold})
  ${autoreg ? 'Идёт поиск новой игры...' : ''}`,
      Markup.inlineKeyboard([
        Markup.button.callback('Остановить поиск', 'stop', !autoreg),
        Markup.button.callback('Выход в лобби', 'exit', autoreg),
      ]),
    );

    if (autoreg) {
      messages[message.chat.id] = message.message_id;
      await broadcast(
        `Игрок ${clan ? `\\[${clan.name}]` : ''} *${nickname}* (${Profs.profsData[prof].icon}${lvl}) начал поиск игры`,
      );
    }
  } catch (e) {
    console.log(`error: sendExitButton: ${e.message} for ${player.id}`);
  }
}
