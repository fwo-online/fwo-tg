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
        Markup.button.callback('Избранные магии', 'favorite'),
      ],
      [
        Markup.button.callback('Учить', ctx.session.character.lvl === 1 ? 'learn_1' : 'select_lvl', !ctx.session.character.bonus),
        Markup.button.callback('В профиль', 'back')],
    ]),
  );
});

magicScene.action(/favorite$|favorite_add(?=_)|favorite_remove_\d/, async (ctx) => {
  const [, action, index, magicName] = ctx.match.input.split('_');

  if (action === 'add') {
    ctx.session.character.favoriteMagicList[Number(index)] = magicName;
    await ctx.session.character.saveToDb();
  }

  if (action === 'remove') {
    ctx.session.character.favoriteMagicList.splice(Number(index), 1);
    await ctx.session.character.saveToDb();
  }

  const favorites = ctx.session.character.favoriteMagicList;

  await ctx.editMessageText(
    'Выбери список магий, которые будут отображаться в бою',
    Markup.inlineKeyboard(
      [
        ...favorites.map((magic, i) => [
          Markup.button.callback(arena.magics[magic].displayName || '+', `favorite_select_${i}`),
          Markup.button.callback('-', `favorite_remove_${i}`),
        ]),
        [
          Markup.button.callback('+', `favorite_select_${favorites.length}`, favorites.length >= 5),
        ],
        [Markup.button.callback('Назад', 'magics')],
      ],
    ),
  );
});

magicScene.action(/favorite_select_\d/, async (ctx) => {
  const { magics, favoriteMagicList } = ctx.session.character;
  const [, , index] = ctx.match.input.split('_');

  const favoriteMagicSet = new Set(favoriteMagicList);
  const aviableMagicList = Object.keys(magics).filter((magic) => !favoriteMagicSet.has(magic));

  await ctx.editMessageText(
    aviableMagicList.length ? 'Выбери магию' : 'Нет доступных магий для выбора',
    Markup.inlineKeyboard([
      ...aviableMagicList.map((magic) => [Markup.button.callback(arena.magics[magic].displayName, `favorite_add_${index}_${magic}`)]),
      [Markup.button.callback('Назад', 'favorite')],
    ]),
  );
});

/** Ожиадем "learn_${lvl}", где lvl - уровень изучаемой магии */
magicScene.action(/magics|learn(?=_)/, async (ctx) => {
  const [, magicLvl] = ctx.match.input.split('_');

  if (magicLvl) {
    try {
      ctx.session.character = await MagicService.learn(ctx.session.character.id, +magicLvl);
      await ctx.answerCbQuery('Теперь ты знаешь на одну магию больше');
    } catch (e) {
      await ctx.answerCbQuery(e.message);
    }
  }

  await ctx.editMessageText(
    `Известные магии. Нажми на магию, чтобы узнать о ней больше.
${ctx.session.character.lvl === 1 ? `Стоимость изучения магии *1💡*(${ctx.session.character.bonus}💡)` : ''}`,
    {
      ...Markup.inlineKeyboard([
        ...getMagicButtons(ctx.session.character),
        [
          Markup.button.callback('Учить', ctx.session.character.lvl === 1 ? 'learn_1' : 'select_lvl', !ctx.session.character.bonus),
          Markup.button.callback('В профиль', 'back'),
        ],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

magicScene.action('select_lvl', async (ctx) => {
  const magicLvl = Math.min(ctx.session.character.lvl, 4, ctx.session.character.bonus);

  await ctx.editMessageText(
    `Выбери уровень изучаемой магии. Стоимость изучения равна уровню магии (*${ctx.session.character.bonus}💡*)`,
    {
      ...Markup.inlineKeyboard([
        getLvlButtons(magicLvl),
        [
          Markup.button.callback('Назад', 'magics'),
        ],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

/** Ожиадем "about_${name}", где name - название магии */
magicScene.action(/about(?=_)/, async (ctx) => {
  const [, name] = ctx.match.input.split('_');
  const magic = MagicService.show(name);
  await ctx.editMessageText(
    `${magic.name}: ${magic.desc}`,
    Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'magics'),
    ]),
  );
});

magicScene.action('back', async (ctx) => {
  await ctx.scene.enter('profile');
});

magicScene.hears('🔙 В лобби', async (ctx) => {
  await ctx.scene.enter('lobby');
});
