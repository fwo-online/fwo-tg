import { Scenes, Markup } from 'telegraf';
import ClanService from '../arena/ClanService';
import type { BotContext } from '../fwo';
import db from '../helpers/dataBase';

export const createClanScene = new Scenes.BaseScene<BotContext>('createClan');

/**
 * Валидация названия клана
 * @param name
 */
async function valid(name: string) {
  const trimName = name.trim();
  if (trimName.length > 16) {
    throw new Error('Слишком длинное название. Попробуй короче');
  } else if (trimName.length < 3) {
    throw new Error('Напрягись, ещё пару символов!');
  } else if (trimName.charAt(0) === '/') {
    throw new Error('Запрещено начинать клан с "/" ');
  }

  const resp = await db.clan.findName(trimName);
  if (resp) {
    throw new Error('Кто-то придумал это до тебя!');
  } else {
    return trimName;
  }
}

createClanScene.enter(async (ctx) => {
  ctx.reply(
    `Стоимость создания клана: 100💰.
${ctx.session.character.clan ? 'Сначала тебе нужно покинуть свой клан' : 'Введи название клана:'}`,
    Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'back'),
    ]),
  );
});

createClanScene.hears('🔙 В лобби', (ctx) => {
  ctx.scene.enter('lobby');
});

createClanScene.on('text', async (ctx) => {
  try {
    const clanName = await valid(ctx.message.text);
    const char = await ClanService.createClan(ctx.session.character.id, clanName);
    ctx.session.character = char;
    ctx.scene.enter('clan');
  } catch (e) {
    await ctx.reply(e.message);
  }
});

createClanScene.action('back', (ctx) => {
  ctx.scene.enter('clan');
});
