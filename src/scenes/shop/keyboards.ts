import _ from 'lodash';
import { Markup } from 'telegraf';
import type { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import arena from '../../arena';
import type Char from '../../arena/CharacterService';
import { stores } from '../../arena/MiscService';
import { collections } from '../../data/collection';
import type { Prof } from '../../data/profs';
import type { Item } from '../../models/item';

const storeKeys = Object.keys(stores);

const itemToButton = (item: Item) => [Markup.callbackButton(
  `${item.name} (💰 ${item.price})`,
  `itemInfo_${item.code}`,
)];

/**
 * Возвращет кнопки по всем типам вещей из stores
 */
const getTypeButtons = () => storeKeys.map((type) => [Markup.callbackButton(
  `${stores[type]}`,
  `itemType_${type}`,
)]);

/**
 * Возвращает предметы по выбранному типу.
 * Не показывает вещи, которые не подходят персонажу по профессии
 * @param wear - тип вещей (куда надевается)
 * @param prof - профессия персонажа
 */
const getItems = (wear: string, prof: Prof) => {
  const items = _.filter(
    arena.items,
    (item) => item.wear === wear && item.race.includes(prof) && !item.onlymake && !item.hide,
  );
  const buttons = items
    .sort((a, b) => b.price - a.price)
    .map(itemToButton);
  buttons.push([Markup.callbackButton(
    'Назад',
    'back',
  )]);
  return buttons;
};

export const enter = (): ExtraReplyMessage => Markup.inlineKeyboard([
  ...getTypeButtons(),
  [Markup.callbackButton('Коллекции', 'collectionList')],
]).resize().extra();

export const itemType = (type: string, char: Char): ExtraReplyMessage => Markup.inlineKeyboard(
  getItems(type, char.prof),
).resize().extra();

export const itemInfo = (code: string): ExtraReplyMessage => Markup.inlineKeyboard([
  Markup.callbackButton(
    'Купить',
    `buy_${code}`,
  ),
  Markup.callbackButton(
    'Назад',
    `itemType_${arena.items[code].wear}`,
  )]).resize().extra({ parse_mode: 'Markdown' });

export const buy = (code: string): ExtraReplyMessage => Markup.inlineKeyboard([
  [Markup.callbackButton(
    'В инвентарь',
    'inventory',
  )],
  [Markup.callbackButton(
    'Продолжить покупки',
    `itemType_${arena.items[code].wear}`,
  )],
]).resize().extra();

export const collectionList = (): ExtraReplyMessage => {
  const keys = Object.keys(collections);
  const buttons = keys.map((key) => [
    Markup.callbackButton(collections[key].name, `collection_${key}`),
  ]);

  return Markup.inlineKeyboard(
    buttons,
  ).resize().extra();
};

export const collectionItem = (key: string): ExtraReplyMessage => {
  const items = _.filter(arena.items, (item) => item.wcomb.includes(key));
  const buttons = items.map(itemToButton);
  return Markup.inlineKeyboard([
    ...buttons,
    [Markup.callbackButton('Назад', 'collectionList')],
  ]).resize().extra();
};
