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
  select: Markup.inlineKeyboard([
    Markup.button.callback('Выбрать', 'select'),
    Markup.button.callback('Назад', 'back'),
  ]),
  empty: Markup.inlineKeyboard([]),
};
