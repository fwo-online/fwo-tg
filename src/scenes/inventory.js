const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const Inventory = require('../models/inventory');

const inventoryScene = new Scene('inventory');

const getInventoryItems = (items) => items.map((item) => Markup.callbackButton(
  `${item.code}`,
  item.code,
));

inventoryScene.enter(async ({ editMessageText, session }) => {
  const items = await Inventory.getPutOned(session.character.id);

  editMessageText(
    `Твой инвентарь, ${session.character.nickname}`,
    Markup.inlineKeyboard([getInventoryItems(items)]).resize().extra(),
  );
});

module.exports = inventoryScene;
