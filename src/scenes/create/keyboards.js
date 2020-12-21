const Markup = require('telegraf/markup');
const { profs } = require('../../data/profs');

module.exports = {
  create: Markup.inlineKeyboard([
    Markup.callbackButton('Создать', 'create'),
  ]).resize().extra(),
  profButtons: Markup.inlineKeyboard(Object
    .keys(profs)
    .map((prof) => [Markup.callbackButton(
      `${profs[prof].name} ${profs[prof].icon}`,
      `select_${prof}`,
    )])).resize().extra(),
  select: Markup.inlineKeyboard([
    Markup.callbackButton('Выбрать', 'select'),
    Markup.callbackButton('Назад', 'back'),
  ]).resize().extra(),
  empty: Markup.inlineKeyboard([]),
};
