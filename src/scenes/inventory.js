const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const Inventory = require('../models/inventory');
const ItemService = require('../arena/ItemService');

const inventoryScene = new Scene('inventory');
const { leave } = Stage;

const getInventoryItems = (items) => items.map((item) => [Markup.callbackButton(
  `${Inventory.getItemName(item.code)}`,
  `itemInfo_${item._id}`,
)]);

inventoryScene.enter(async ({ session, reply }) => {
  const { items } = session.character;

  reply(
    `Твой инвентарь, ${session.character.nickname}`,
    Markup.inlineKeyboard(getInventoryItems(items)).resize().extra(),
  );
});

inventoryScene.action('inventoryBack', async ({ session, editMessageText }) => {
  const { items } = session.character;

  editMessageText(
    `Твой инвентарь, ${session.character.nickname}`,
    Markup.inlineKeyboard(getInventoryItems(items)).resize().extra(),
  );
});

inventoryScene.action(/itemInfo(?=_)/,
  async ({ session, editMessageText, match }) => {
    const [, itemId] = match.input.split('_');
    const item = session.character.getItem(itemId);
    const itemDescription = ItemService.itemDescription(
      session.character,
      global.arena.items[item.code],
    );
    const itemAction = item.putOn ? Markup.callbackButton('Снять',
      `putOff_${itemId}`) : Markup.callbackButton('Надеть',
      `putOn_${itemId}`);

    editMessageText(
      `${itemDescription}`,
      Markup.inlineKeyboard([
        itemAction,
        Markup.callbackButton('Продать', `sell_${itemId}`),
        Markup.callbackButton('Назад', 'back'),
      ]).resize().extra(),
    );
  });

inventoryScene.action(/putOff(?=_)/,
  async ({ session, editMessageText, match }) => {
    const [, itemId] = match.input.split('_');
    await session.character.putOffItem(itemId);

    editMessageText(
      'Предмет успешно снят!',
      Markup.inlineKeyboard([
        Markup.callbackButton('Назад', 'inventoryBack'),
      ]).resize().extra(),
    );
  });

inventoryScene.action(/putOn(?=_)/,
  async ({ session, editMessageText, match }) => {
    const [, itemId] = match.input.split('_');

    const result = await session.character.putOnItem(itemId);

    if (result) {
      editMessageText(
        'Предмет успешно надет!',
        Markup.inlineKeyboard([
          Markup.callbackButton('Назад', 'inventoryBack'),
        ]).resize().extra(),
      );
    } else {
      editMessageText(
        'Недостаточно характеристик либо на этом место уже надет предмет',
        Markup.inlineKeyboard([
          Markup.callbackButton('Назад', 'inventoryBack'),
        ]).resize().extra(),
      );
    }
  });

inventoryScene.action(/sell(?=_)/,
  async ({ session, editMessageText, match }) => {
    const [, itemId] = match.input.split('_');

    session.character.sellItem(itemId);

    editMessageText(
      'Предмет успешно продан!',
      Markup.inlineKeyboard([
        Markup.callbackButton('Назад', 'inventoryBack'),
      ]).resize().extra(),
    );
  });

inventoryScene.action('back', ({ scene }) => {
  scene.reenter();
});

inventoryScene.hears('🔙 Назад', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

module.exports = inventoryScene;
