import { Scenes, Markup } from 'telegraf';
import type Char from '../arena/CharacterService';
import { Harks } from '../data';
import type { BotContext } from '../fwo';
import { mono } from '../utils/formatString';

export const harkScene = new Scenes.BaseScene<BotContext>('harks');

const getInlineKeyboard = (character: Char) => {
  const inlineKeyboardArr = Harks.harksList
    .map((hark) => [
      Markup.button.callback(
        `${Harks.harksData[hark].name}: ${character.harks[hark]}`,
        `info_${hark}`,
      ),
      Markup.button.callback(
        `+ ${character.getIncreaseHarkCount(hark)}`,
        `increase_${hark}`,
      ),
    ]);
  inlineKeyboardArr.push([Markup.button.callback('Подтвердить', 'confirm')]);
  inlineKeyboardArr.push([Markup.button.callback('Сбросить', 'reset')]);
  inlineKeyboardArr.push([Markup.button.callback('Доп. характеристики', 'def_harks')]);
  inlineKeyboardArr.push([Markup.button.callback('В профиль', 'exit')]);

  return inlineKeyboardArr;
};

harkScene.enter(async (ctx) => {
  const { free } = ctx.session.character;
  await ctx.replyWithMarkdown(
    '*Характеристики*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );
  ctx.reply(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(ctx.session.character),
    ]),
  );
});

harkScene.action(/info(?=_)/, (ctx) => {
  const [, hark] = ctx.match.input.split('_') as [string, Harks.Hark];
  ctx.editMessageText(
    Harks.harksData[hark].descr,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Назад', 'back')],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

harkScene.action(/confirm|reset|back|increase(?=_)/, async (ctx) => {
  if (ctx.match.input.includes('increase_')) {
    try {
      const [, hark] = ctx.match.input.split('_');
      ctx.session.character.increaseHark(hark);
    } catch (e) {
      ctx.answerCbQuery(e.message);
    }
  }
  if (ctx.match.input === 'confirm') {
    await ctx.session.character.submitIncreaseHarks();
    await ctx.answerCbQuery('Изменения успешно применены');
  }
  if (ctx.match.input === 'reset') {
    ctx.session.character.resetHarks();
    await ctx.answerCbQuery('Изменения успешно сброшены');
  }

  ctx.editMessageText(
    `Свободных очков ${ctx.session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(ctx.session.character),
    ]),
  );
});

harkScene.action('def_harks', (ctx) => {
  const { def, prof } = ctx.session.character;
  const message = mono([`
Урон:                     ${def.hit.min} - ${def.hit.max}
Атака:                    ${def.patk}
Защита:                   ${def.pdef}
Здоровье:                 ${def.maxHp}
Лечение:                  ${def.hl.min} - ${def.hl.max}
Мана:                     ${def.maxMp}
Восстановление маны:      ${def.reg_mp}
Энергия:                  ${def.maxEn}
Восстановление энергии:   ${def.reg_en}
Магическая атака:         ${def.mga}
Магическая защита:        ${def.mgp}`,
  prof === 'l' && `${`Кол-во целей для атаки:  ${def.maxTarget}`}`,
  (prof === 'm' || prof === 'p') && `${`Длительность магии:       ${def.lspell}`}`,
  ].filter((val) => val).join('\n'));

  ctx.editMessageText(
    message,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Назад', 'back')],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

harkScene.action('exit', (ctx) => {
  ctx.session.character.resetHarks();
  ctx.scene.enter('profile');
});

harkScene.hears('🔙 В лобби', (ctx) => {
  ctx.session.character.resetHarks();
  ctx.scene.enter('lobby');
});
