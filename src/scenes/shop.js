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

const INFO_NAMES = {
  hit: 'Удар',
  atc: 'Атака',
  prt: 'Защита',

  hark: 'Требуемые характеристики',
};

const HARK_NAMES = {
  s: ['str', 'Сила'],
  d: ['dex', 'Ловкость'],
  w: ['wis', 'Мудрость'],
  i: ['int', 'Интелект'],
  c: ['con', 'Телосложение'],
};

const getTypeButtons = (types) => {
  const buttons = types.map((type) => [Markup.callbackButton(
    `${STORES[type]}`,
    `itemType_${type}`,
  )]);
  buttons.push([Markup.callbackButton(
    'Выход',
    'leave',
  )]);
  return buttons;
};

const getItems = (wear, prof) => {
  const items = _.filter(global.arena.items, { wear });
  const filteredItems = items.filter((item) => item.race.includes(prof));
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

const getItemInfo = (item, character) => {
  const parseAttr = ItemService.itemAtrParser(item);
  const infoNames = Object.keys(INFO_NAMES);
  let string = `${item.name} (${item.price}) \n${item.descr}`;
  infoNames.forEach((name) => {
    if (parseAttr[name]) {
      if (name === 'hark') {
        string += `\n\n${INFO_NAMES[name]}:`;
        const harks = Object.keys(parseAttr.hark);
        harks.forEach((hark) => {
          const harkArr = HARK_NAMES[hark];
          const isWear = character.harks[harkArr[0]] < parseAttr.hark[hark];
          string += `\n${isWear ? '❗️' : '✅'} ${harkArr[1]}: ${parseAttr.hark[hark]} ${isWear ? `(${character.harks[harkArr[0]] - parseAttr.hark[hark]})` : ''}`;
        });
      } else if (name === 'hit') {
        string += `\n${INFO_NAMES[name]}: ${parseAttr.hit.min}/${parseAttr.hit.min}`;
      } else {
        string += `\n${INFO_NAMES[name]}: ${parseAttr[name]}`;
      }
    }
  });
  return string;
};

shopScene.enter(({ reply }) => {
  const keys = Object.keys(STORES);

  reply(
    'Список категорий товаров',
    Markup.inlineKeyboard(getTypeButtons(keys)).resize().extra(),
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
    getItemInfo(item, session.character),
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
  const keys = Object.keys(STORES);

  editMessageText(
    'Список товаров',
    Markup.inlineKeyboard(getTypeButtons(keys)).resize().extra(),
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
