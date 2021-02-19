import _ from 'lodash';
import arena from '../../arena';
import type Char from '../../arena/CharacterService';
import { itemDescription, attrNames } from '../../arena/ItemService';
import { stores } from '../../arena/MiscService';
import { Collections } from '../../data';

export const enter = (): string => 'Список категорий товаров';

export const itemType = (type: string): string => `${stores[type]}`;

export const itemInfo = (code: string, char: Char): string => {
  const item = arena.items[code];
  return itemDescription(char, item);
};

export const buy = (code: string, char: Char): string => {
  const item = arena.items[code];
  return `Ты купил предмет ${item.name}. У тебя осталось 💰 ${char.gold}`;
};

export const noGold = (): string => 'Недостаточно голды';

export const collectionList = (): string => 'Коллекции';

export const collectionItem = (name: string): string => {
  const collection = Collections.collectionsData[name];

  return [
    collection.name,
    collection.harks && _.map(collection.harks, (val, key) => `\n${attrNames.hark[key]}: ${val}`).join(''),
    collection.resists && _.map(collection.resists, (val, key) => `\n${attrNames[`r_${key}`]} : ${100 - (val ?? 0) * 100}%`).join(''),
    collection.statical && _.map(collection.statical, (val, key) => `\n${attrNames[key]} : ${_.isObject(val) ? val.max : val}`).join(''),
  ].filter(_.isString).join('\n');
};
