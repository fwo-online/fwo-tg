import { Scenes, Markup } from 'telegraf';
import arena from '../arena';
import MagicService from '../arena/MagicService';
import type { BotContext } from '../fwo';

export const magicScene = new Scenes.BaseScene<BotContext>('magics');

const getMagicButtons = (character) => Object
  .keys(character.magics)
  .map((key) => [
    Markup.button.callback(
      `${arena.magics[key].displayName}: ${character.magics[key]}`,
      `about_${key}`,
    ),
  ]);

const getLvlButtons = (length: number) => new Array(length).fill(0)
  .reduce<number[]>((arr, curr, i) => [...arr, i + 1], [])
  .map((lvl) => Markup.button.callback(lvl.toString(), `learn_${lvl}`));

magicScene.enter(async (ctx) => {
  await ctx.replyWithMarkdown(
    '*Магии*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );

  await ctx.replyWithMarkdown(
    `Известные магии. Нажми на магию, чтобы узнать о ней больше.
${ctx.session.character.lvl === 1 ? `Стоимость изучения магии *1💡*(${ctx.session.character.bonus}💡)` : ''}`,
    Markup.inlineKeyboard([
      ...getMagicButtons(ctx.session.character),
      [
        Markup.button.callback('Учить', ctx.session.character.lvl === 1 ? 'learn_1' : 'select_lvl'),
        Markup.button.callback('В профиль', 'back')],
    ]),
  );
});

/** Ожиадем "learn_${lvl}", где lvl - уровень изучаемой магии */
magicScene.action(/magics|learn(?=_)/, async (ctx) => {
  const [, lvl] = ctx.match.input.split('_');
  if (lvl) {
    try {
      ctx.session.character = MagicService.learn(ctx.session.character.id, +lvl);
      ctx.answerCbQuery('Теперь ты знаешь на одну магию больше');
    } catch (e) {
      ctx.answerCbQuery(e.message);
    }
  }

  ctx.editMessageText(
    `Известные магии. Нажми на магию, чтобы узнать о ней больше.
${ctx.session.character.lvl === 1 ? `Стоимость изучения магии *1💡*(${ctx.session.character.bonus}💡)` : ''}`,
    {
      ...Markup.inlineKeyboard([
        ...getMagicButtons(ctx.session.character),
        [
          Markup.button.callback('Учить', ctx.session.character.lvl === 1 ? 'learn_1' : 'select_lvl'),
          Markup.button.callback('В профиль', 'back'),
        ],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

magicScene.action('select_lvl', (ctx) => {
  const lvl = Math.min(ctx.session.character.lvl, 4);

  ctx.editMessageText(
    `Выбери уровень изучаемой магии. Стоимость изучения равна уровню магии (*${ctx.session.character.bonus}💡*)`,
    {
      ...Markup.inlineKeyboard([
        getLvlButtons(lvl),
        [
          Markup.button.callback('Назад', 'magics'),
        ],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

/** Ожиадем "about_${name}", где name - название магии */
magicScene.action(/about(?=_)/, (ctx) => {
  const [, name] = ctx.match.input.split('_');
  const magic = MagicService.show(name);
  ctx.editMessageText(
    `${magic.name}: ${magic.desc}`,
    Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'magics'),
    ]),
  );
});

magicScene.action('back', (ctx) => {
  ctx.scene.enter('profile');
});

magicScene.hears('🔙 В лобби', (ctx) => {
  ctx.scene.enter('lobby');
});
