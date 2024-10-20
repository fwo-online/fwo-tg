import _ from 'lodash';
import { Markup } from 'telegraf';
import type { Convenience } from 'telegraf/types';
import arena from '../../arena';
import type Char from '../../arena/CharacterService';
import { stores } from '../../arena/MiscService';
import { Collections, Profs } from '../../data';
import type { Item } from '../../models/item';

const storeKeys = Object.keys(stores);

const itemToButton = (item: Item) => [Markup.button.callback(
  `${item.name} (💰 ${item.price})`,
  `itemInfo_${item.code}`,
)];

/**
 * Возвращет кнопки по всем типам вещей из stores
 */
const getTypeButtons = () => storeKeys.map((type) => [Markup.button.callback(
  `${stores[type]}`,
  `itemType_${type}`,
)]);

/**
 * Возвращает предметы по выбранному типу.
 * Не показывает вещи, которые не подходят персонажу по профессии
 * @param wear - тип вещей (куда надевается)
 * @param prof - профессия персонажа
 */
const getItems = (wear: string, prof: Profs.Prof) => {
  const items: Item[] = _.filter(
    arena.items,
    (item: Item) => item.wear === wear && item.race.includes(prof) && !item.onlymake && !item.hide,
  );
  const buttons = items
    .sort((a, b) => b.price - a.price)
    .map(itemToButton);
  buttons.push([Markup.button.callback(
    'Назад',
    'back',
  )]);
  return buttons;
};

export const enter = (): Convenience.ExtraEditMessageText => Markup.inlineKeyboard([
  ...getTypeButtons(),
  [Markup.button.callback('Коллекции', 'collectionList')],
]);

export const itemType = (
  type: string, char: Char,
): Convenience.ExtraEditMessageText => Markup.inlineKeyboard(
  getItems(type, char.prof),
);

export const itemInfo = (code: string):Convenience.ExtraEditMessageText => ({
  ...Markup.inlineKeyboard([
    [
      Markup.button.callback(
        'Купить',
        `buy_${code}`,
      ),
      Markup.button.callback(
        'Назад',
        `itemType_${arena.items[code].wear}`,
      ),
    ],
  ]),
  parse_mode: 'Markdown',
});

export const buy = (code: string): Convenience.ExtraEditMessageText => Markup.inlineKeyboard([
  [Markup.button.callback(
    'В инвентарь',
    'inventory',
  )],
  [Markup.button.callback(
    'Продолжить покупки',
    `itemType_${arena.items[code].wear}`,
  )],
]);

export const collectionList = (): Convenience.ExtraEditMessageText => {
  const keys = Object.keys(Collections.collectionsData);
  const buttons = keys.map((key) => [
    Markup.button.callback(Collections.collectionsData[key].name, `collection_${key}`),
  ]);

  return Markup.inlineKeyboard(
    buttons,
  );
};

export const collectionItem = (key: string): Convenience.ExtraEditMessageText => {
  const items = _.filter(arena.items, (item: Item) => item.wcomb.includes(key));
  const buttons = items.map(itemToButton);
  return Markup.inlineKeyboard([
    ...buttons,
    [Markup.button.callback('Назад', 'collectionList')],
  ]);
};
