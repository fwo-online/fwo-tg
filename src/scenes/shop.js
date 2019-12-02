const _ = require('lodash');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const Inventory = require('../models/inventory');
const ItemService = require('../arena/ItemService');

const { leave } = Stage;

const shopScene = new Scene('shopScene');

const STORES = {
  a: 'Пр.рука',
  b: 'Лв.рука',
  c: 'Тело',
  d: 'Голова',
  e: 'Ноги',
  f: 'Пояс',
  h: 'Пр.запястье',
  i: 'Лв.запястье',
  j: 'Плечи',
  k: 'Пр.больш.палец',
  l: 'Пр.указ.палец',
  m: 'Пр.сред.палец',
  n: 'Пр.безым.палец',
  o: 'Пр.мизинец',
  p: 'Лв.больш.палец',
  r: 'Лв.указ.палец',
  s: 'Лв.сред.палец',
  t: 'Лв.безым.палец',
  u: 'Лв.мизинец',
  1: 'Свитки',
  x: 'Зелья',
  y: 'Сырье',
  z: 'Промтовары',
  q: 'Руки',
  v: 'Ухо',
  w: 'Обувь',
  ab: 'Двуручное оружие',
};
const storeKeys = Object.keys(STORES);

/**
 * Возвращет кнопки по всем типам вещей из STORES
 * @returns {array}
 */
const getTypeButtons = () => {
  const buttons = storeKeys.map((type) => [Markup.callbackButton(
    `${STORES[type]}`,
    `itemType_${type}`,
  )]);
  buttons.push([Markup.callbackButton(
    'Выход',
    'leave',
  )]);
  return buttons;
};

/**
 * Возвращает предметы по выбранному типу.
 * Не показывает вещи, которые не подходят персонажу по профессии
 * @param {string} wear - тип вещей (куда надевается)
 * @param {string} prof - профессия персонажа
 * @returns {array}
 */
const getItems = (wear, prof) => {
  const items = _.filter(global.arena.items, { wear });
  const filteredItems = items
    .filter((item) => item.race.includes(prof) && !item.onlymake && item.hide === '0')
    .sort((a, b) => a.price - b.price);
  const buttons = filteredItems.map((item) => [Markup.callbackButton(
    `${item.name} (${item.price})`,
    `itemInfo_${item.code}`,
  )]);
  buttons.push([Markup.callbackButton(
    'Назад',
    'back',
  )]);
  return buttons;
};

shopScene.enter(({ reply }) => {
  reply(
    'Список категорий товаров',
    Markup.inlineKeyboard(getTypeButtons()).resize().extra(),
  );
});

shopScene.action(/itemType(?=_)/, async ({ session, editMessageText, match }) => {
  const [, type] = match.input.split('_');

  editMessageText(
    `${STORES[type]}`,
    Markup.inlineKeyboard(getItems(type, session.character.prof)).resize().extra(),
  );
});

shopScene.action(/itemInfo(?=_)/, async ({ session, editMessageText, match }) => {
  const [, code] = match.input.split('_');
  const item = global.arena.items[code];
  editMessageText(
    ItemService.harkToString(session.character, item),
    Markup.inlineKeyboard([
      Markup.callbackButton(
        'Купить',
        `buy_${code}`,
      ),
      Markup.callbackButton(
        'Назад',
        `itemType_${item.wear}`,
      )]).resize().extra(),
  );
});

shopScene.action(/buy(?=_)/, async ({
  session,
  editMessageText,
  scene,
  match,
}) => {
  const [, code] = match.input.split('_');
  const item = global.arena.items[code];
  if (session.character.gold < item.price) {
    editMessageText(
      'Недостаточно голды',
      Markup.inlineKeyboard([
        Markup.callbackButton(
          'Назад',
          `itemType_${item.wear}`,
        )]).resize().extra(),
    );
  } else {
    try {
      session.character.gold -= item.price;
      await Inventory.addItem(session.character.id, code);
      await session.character.saveToDb();
      editMessageText(
        `Ты купил предмет ${item.name}. У тебя осталось 💰 ${session.character.gold}`,
        Markup.inlineKeyboard([
          Markup.callbackButton(
            'В инвентарь',
            'inventory',
          ),
          Markup.callbackButton(
            'В лобби',
            'leave',
          ),
          Markup.callbackButton(
            'Назад',
            `itemType_${item.wear}`,
          )]).resize().extra(),
      );
    } catch (e) {
      scene.reenter();
    }
  }
});

shopScene.action('back', ({ editMessageText }) => {
  editMessageText(
    'Список товаров',
    Markup.inlineKeyboard(getTypeButtons()).resize().extra(),
  );
});

shopScene.action('leave', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

shopScene.action('inventory', ({ scene }) => {
  leave();
  scene.enter('inventory');
});

module.exports = shopScene;
