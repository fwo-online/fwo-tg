const { BaseScene, Markup } = require('telegraf');
const { harksDescr, mono } = require('../arena/MiscService');

/** @type {import('./stage').BaseGameScene} */
const harkScene = new BaseScene('harks');

/**
 * @param {import ('../arena/CharacterService')} character
 */
const getInlineKeyboard = (character) => {
  const inlineKeyboardArr = Object
    .keys(harksDescr)
    .map((hark) => [
      Markup.callbackButton(
        `${harksDescr[hark].name}: ${character.harks[hark]}`,
        `info_${hark}`,
      ),
      Markup.callbackButton(
        `+ ${character.getIncreaseHarkCount(hark)}`,
        `increase_${hark}`,
      ),
    ]);
  inlineKeyboardArr.push([Markup.callbackButton('Подтвердить', 'confirm')]);
  inlineKeyboardArr.push([Markup.callbackButton('Сбросить', 'reset')]);
  inlineKeyboardArr.push([Markup.callbackButton('Доп. характеристики', 'def_harks')]);
  inlineKeyboardArr.push([Markup.callbackButton('В профиль', 'exit')]);

  return inlineKeyboardArr;
};

harkScene.enter(async ({ replyWithMarkdown, reply, session }) => {
  const { free } = session.character;
  await replyWithMarkdown(
    '*Характеристики*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
  reply(
    `Свободных очков ${free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

harkScene.action(/info(?=_)/, ({ editMessageText, match }) => {
  const [, hark] = match.input.split('_');
  editMessageText(harksDescr[hark].descr, Markup.inlineKeyboard([
    Markup.callbackButton('Назад', 'back'),
  ]).resize().extra({ parse_mode: 'Markdown' }));
});

harkScene.action(/confirm|reset|back|increase(?=_)/, async ({
  session, editMessageText, answerCbQuery, match,
}) => {
  if (match.input.includes('increase_')) {
    try {
      const [, hark] = match.input.split('_');
      session.character.increaseHark(hark);
    } catch (e) {
      answerCbQuery(e.message);
    }
  }
  if (match.input === 'confirm') {
    await session.character.submitIncreaseHarks();
    await answerCbQuery('Изменения успешно применены');
  }
  if (match.input === 'reset') {
    session.character.resetHarks();
    await answerCbQuery('Изменения успешно сброшены');
  }

  editMessageText(
    `Свободных очков ${session.character.free}`,
    Markup.inlineKeyboard([
      ...getInlineKeyboard(session.character),
    ]).resize().extra(),
  );
});

harkScene.action('def_harks', ({ session, editMessageText }) => {
  const { def, prof } = session.character;
  const message = mono([`
Урон:                     ${def.hit.min} - ${def.hit.max}
Атака:                    ${def.patk}
Защита:                   ${def.pdef}
Здоровье:                 ${def.maxHp}
Лечение:                  ${def.hl.min} - ${def.hl.max}
Мана:                     ${def.maxMp}
Восстановление маны:      ${def.manaReg}
Энергия:                  ${def.maxEn}
Восстановление энергии:   ${def.enReg}
Магическая атака:         ${def.mga}
Магическая защита:        ${def.mgp}`,
  prof === 'l' && `${`Кол-во целей для атаки:  ${def.maxTarget}`}`,
  (prof === 'm' || prof === 'p') && `${`Длительность магии:       ${def.lspell}`}`,
  ].filter((val) => val).join('\n'));

  editMessageText(message, Markup.inlineKeyboard([
    Markup.callbackButton('Назад', 'back'),
  ]).resize().extra({ parse_mode: 'Markdown' }));
});

harkScene.action('exit', ({ scene, session }) => {
  session.character.resetHarks();
  scene.enter('profile');
});

harkScene.hears('🔙 В лобби', ({ scene, session }) => {
  session.character.resetHarks();
  scene.enter('lobby');
});

module.exports = harkScene;
