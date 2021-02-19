import { Markup } from 'telegraf';
import { Profs } from '../../data';

export const keyboards = {
  create: Markup.inlineKeyboard([
    Markup.button.callback('Создать', 'create'),
  ]),
  profButtons: Markup.inlineKeyboard(
    Profs.profsList
      .map((prof) => [Markup.button.callback(
        `${Profs.profsData[prof].name} ${Profs.profsData[prof].icon}`,
        `select_${prof}`,
      )]),
  ),
  back: Markup.inlineKeyboard([
    Markup.button.callback('Назад', 'back'),
  ]),
  empty: Markup.inlineKeyboard([]),
};
