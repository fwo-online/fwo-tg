import { Markup } from 'telegraf';
import arena from '@/arena';
import type { Player } from '../arena/PlayersService';
import { Profs } from '../data';
import { LogService } from '@/arena/LogService';
import { reservedClanName } from '@fwo/schemas';
import { bold } from '@/utils/formatString';

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
    const getStatusString = (p: { exp: number; gold: number; nick: string }) =>
      `\t👤 ${p.nick} получает ${p.exp}📖 и ${p.gold}💰`;

    broadcast('Игра завершена');
    broadcast(`${bold`Статистика игры`}
${Object.entries(e.statistic).map(([clan, players]) => `${clan === reservedClanName ? 'Без клана' : clan}:\n ${players?.map(getStatusString).join('\n')}`)}`);
  });
});
