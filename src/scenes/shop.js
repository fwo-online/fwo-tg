const _ = require('lodash');
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const Inventory = require('../models/inventory');

const shopScene = new Scene('shop');

const itemTypes = {
  g: 'Амулеты',
  f: 'Поясы',
  c: 'Броня',
  h: 'Браслеты',
};

const getTypeButtons = (types) => types.map((type) => [Markup.callbackButton(
  `${itemTypes[type]}`,
  `itemType_${type}`,
)]);

const getItems = (wear, prof) => {
  const items = _.filter(global.arena.items, { wear });
  const filteredItems = items.filter((item) => item.race.includes(prof));
  return filteredItems.map((item) => [Markup.callbackButton(
    `${item.name}, ${item.price}`,
    `itemInfo_${item.code}`,
  )]);
};

shopScene.enter(async ({ reply }) => {
  const keys = Object.keys(itemTypes);

  reply(
    'Магазин',
    Markup.inlineKeyboard(getTypeButtons(keys)).resize().extra(),
  );
});

shopScene.action(/itemType(?=_)/, async ({ session, editMessageText, match }) => {
  const [, type] = match.input.split('_');

  editMessageText(
    `${itemTypes[type]}`,
    Markup.inlineKeyboard(getItems(type, session.character.prof)).resize().extra(),
  );
});

shopScene.action(/itemInfo(?=_)/, async ({ session, editMessageText, match }) => {
  const [, code] = match.input.split('_');
  const item = global.arena.items[code];

  editMessageText(
    `${item.name}. Цена ${item.price}. У тебя есть ${session.character.gold}`,
    Markup.inlineKeyboard([
      Markup.callbackButton(
        'Купить',
        `buy_${code}`,
      ),
      Markup.callbackButton(
        'Назад',
        'back',
      )]).resize().extra(),
  );
});

shopScene.action(/buy(?=_)/, async ({ session, scene, match }) => {
  const [, code] = match.input.split('_');
  const item = global.arena.items[code];
  if (session.character.gold < item.price) {
    scene.reenter();
  } else {
    try {
      await Inventory.addItem(session.character.id, code);
      session.character.gold -= item.price;
      await session.character.saveToDb();
      scene.reenter();
    } catch (e) {
      scene.reenter();
    }
  }
});


shopScene.action('back', ({ scene }) => {
  scene.reenter();
});

module.exports = shopScene;
