import { Markup } from 'telegraf';
import { profs } from '../../data/profs';

export const keyboards = {
  create: Markup.inlineKeyboard([
    Markup.button.callback('Создать', 'create'),
  ]),
  profButtons: Markup.inlineKeyboard(Object
    .keys(profs)
    .map((prof) => [Markup.button.callback(
      `${profs[prof].name} ${profs[prof].icon}`,
      `select_${prof}`,
    )])),
  back: Markup.inlineKeyboard([
    Markup.button.callback('Назад', 'back'),
  ]),
  empty: Markup.inlineKeyboard([]),
};
