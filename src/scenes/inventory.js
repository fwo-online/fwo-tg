const { BaseScene, Markup } = require('telegraf');
const arena = require('../arena');
const ItemService = require('../arena/ItemService');
const { default: Inventory } = require('../models/inventory');

/** @type {import('./stage').BaseGameScene} */
const inventoryScene = new BaseScene('inventory');

const getInventoryItems = (items) => items.map((item) => [Markup.callbackButton(
  `${item.putOn ? '✔️' : ''} ${Inventory.getItemName(item.code)}`,
  `itemInfo_${item._id}`,
)]);

inventoryScene.enter(async ({ replyWithMarkdown, reply, session }) => {
  const { items } = session.character;
  await replyWithMarkdown(
    '*Инвентарь*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
  await reply(
    'Список вещей',
    Markup.inlineKeyboard(getInventoryItems(items)).resize().extra(),
  );
});

inventoryScene.action('inventoryBack', async ({ session, editMessageText }) => {
  const { items } = session.character;

  await editMessageText(
    'Список вещей',
    Markup.inlineKeyboard(getInventoryItems(items)).resize().extra(),
  );
});

inventoryScene.action(/itemInfo(?=_)/,
  async ({ session, editMessageText, match }) => {
    const [, itemId] = match.input.split('_');
    const item = session.character.getItem(itemId);
    const itemDescription = ItemService.itemDescription(
      session.character,
      arena.items[item.code],
    );
    const itemAction = item.putOn ? Markup.callbackButton('Снять',
      `putOff_${itemId}`) : Markup.callbackButton('Надеть',
      `putOn_${itemId}`);

    editMessageText(
      `${itemDescription}`,
      Markup.inlineKeyboard([
        itemAction,
        Markup.callbackButton('Продать', `sellConfirm_${itemId}`),
        Markup.callbackButton('Назад', 'back'),
      ]).resize().extra({ parse_mode: 'Markdown' }),
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

inventoryScene.action(/sellConfirm(?=_)/,
  ({ editMessageText, session, match }) => {
    const [, itemId] = match.input.split('_');
    const item = session.character.getItem(itemId);
    console.log(item);
    const { name, price } = arena.items[item.code];

    editMessageText(
      `Вы действительно хотите продать _${name}_ (${price / 2} 💰)?`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Да', `sell_${itemId}`),
        Markup.callbackButton('Нет', `itemInfo_${itemId}`),
      ]).resize().extra({ parse_mode: 'Markdown' }),
    );
  }
);

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

inventoryScene.hears('🔙 В лобби', ({ scene }) => {
  scene.leave();
  scene.enter('lobby');
});

module.exports = inventoryScene;
