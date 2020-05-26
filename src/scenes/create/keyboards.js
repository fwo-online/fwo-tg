const Markup = require('telegraf/markup');
const { charDescr } = require('../../arena/MiscService');

module.exports = {
  create: Markup.inlineKeyboard([
    Markup.callbackButton('Создать', 'create'),
  ]).resize().extra(),
  profButtons: Markup.inlineKeyboard(Object
    .keys(charDescr)
    .map((prof) => [Markup.callbackButton(
      `${charDescr[prof].name} ${charDescr[prof].icon}`,
      `select_${prof}`,
    )])).resize().extra(),
  select: Markup.inlineKeyboard([
    Markup.callbackButton('Выбрать', 'select'),
    Markup.callbackButton('Назад', 'back'),
  ]).resize().extra(),
  empty: Markup.inlineKeyboard([]),
};
