const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const Inventory = require('../models/inventory');

const inventoryScene = new Scene('inventory');

const getInventoryItems = (items) => items.map((item) => Markup.callbackButton(
  `${Inventory.getItemName(item.code)}`,
  `itemInfo_${item._id}`,
));

inventoryScene.enter(async ({ session, reply }) => {
  const { items } = session.character;

  reply(
    `Твой инвентарь, ${session.character.nickname}`,
    Markup.inlineKeyboard([getInventoryItems(items)]).resize().extra(),
  );
});

inventoryScene.action('inventoryBack', async ({ session, editMessageText }) => {
  const { items } = session.character;

  editMessageText(
    `Твой инвентарь, ${session.character.nickname}`,
    Markup.inlineKeyboard([getInventoryItems(items)]).resize().extra(),
  );
});

inventoryScene.action(/itemInfo(?=_)/, async ({ session, editMessageText, match }) => {
  const [, itemId] = match.input.split('_');
  const item = session.character.getItem(itemId);
  const itemName = Inventory.getItemName(item.code);
  const itemAction = item.putOn ? Markup.callbackButton('Снять', `putOff_${itemId}`) : Markup.callbackButton('Одеть', `putOn_${itemId}`);

  editMessageText(
    `Выберите действие для вещи ${itemName}`,
    Markup.inlineKeyboard([
      itemAction,
      Markup.callbackButton('Продать', 'sell'),
      Markup.callbackButton('Удалить', 'remove'),
    ]).resize().extra(),
  );
});

inventoryScene.action(/putOff(?=_)/, async ({ session, editMessageText, match }) => {
  const [, itemId] = match.input.split('_');
  await session.character.putOffItem(itemId);

  editMessageText(
    'Предмет успешно снят!',
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'inventoryBack'),
    ]).resize().extra(),
  );
});

inventoryScene.action(/putOn(?=_)/, async ({ session, editMessageText, match }) => {
  const [, itemId] = match.input.split('_');

  await session.character.putOnItem(itemId);

  editMessageText(
    'Предмет успешно надет!',
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'inventoryBack'),
    ]).resize().extra(),
  );
});

module.exports = inventoryScene;
