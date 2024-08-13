import { Scenes, Markup } from 'telegraf';
import type { Inventory } from '@/models/inventory';
import { InventoryModel } from '@/models/inventory';
import arena from '../arena';
import ItemService from '../arena/ItemService';
import type { BotContext } from '../fwo';

export const inventoryScene = new Scenes.BaseScene<BotContext>('inventory');

const getInventoryItems = (items: Inventory[]) => items.map((item) => [
  Markup.button.callback(
    `${item.putOn ? '✔️' : ''} ${InventoryModel.getItemName(item.code)}`,
    `itemInfo_${item._id}`,
  ),
]);

inventoryScene.enter(async (ctx) => {
  const { inventory } = ctx.session.character.inventory;
  await ctx.replyWithMarkdown(
    '*Инвентарь*',
    Markup.keyboard([['🔙 В лобби']]).resize(),
  );
  await ctx.reply(
    'Список вещей',
    Markup.inlineKeyboard(getInventoryItems(inventory)),
  );
});

inventoryScene.action('inventoryBack', async (ctx) => {
  const { inventory } = ctx.session.character.inventory;

  await ctx.editMessageText(
    'Список вещей',
    Markup.inlineKeyboard(getInventoryItems(inventory)),
  );
});

inventoryScene.action(/itemInfo(?=_)/, async (ctx) => {
  const [, itemId] = ctx.match.input.split('_');
  const item = ctx.session.character.inventory.getItem(itemId);
  if (!item) return;

  const itemDescription = ItemService.itemDescription(
    ctx.session.character,
    arena.items[item.code],
  );
  const itemAction = item.putOn
    ? Markup.button.callback('Снять', `putOff_${itemId}`)
    : Markup.button.callback('Надеть', `putOn_${itemId}`);

  await ctx.editMessageText(`${itemDescription}`, {
    ...Markup.inlineKeyboard([
      [
        itemAction,
        Markup.button.callback('Продать', `sellConfirm_${itemId}`),
        Markup.button.callback('Назад', 'back'),
      ],
    ]),
    parse_mode: 'Markdown',
  });
});

inventoryScene.action(/putOff(?=_)/, async (ctx) => {
  const [, itemId] = ctx.match.input.split('_');
  await ctx.session.character.inventory.unEquipItem(itemId);
  await ctx.answerCbQuery('Предмет успешно снят!');

  await ctx.editMessageReplyMarkup(
    Markup.inlineKeyboard([
      [
        Markup.button.callback('Надеть', `putOn_${itemId}`),
        Markup.button.callback('Продать', `sellConfirm_${itemId}`),
        Markup.button.callback('Назад', 'back'),
      ],
    ]).reply_markup,
  );
});

inventoryScene.action(/putOn(?=_)/, async (ctx) => {
  const [, itemId] = ctx.match.input.split('_');

  try {
    await ctx.session.character.inventory.equipItem(itemId);
    await ctx.answerCbQuery('Предмет успешно надет!');
    await ctx.editMessageReplyMarkup(
      Markup.inlineKeyboard([
        [
          Markup.button.callback('Снять', `putOff_${itemId}`),
          Markup.button.callback('Продать', `sellConfirm_${itemId}`),
          Markup.button.callback('Назад', 'back'),
        ],
      ]).reply_markup,
    );
  } catch (e) {
    await ctx.answerCbQuery(e.message);
  }
});

inventoryScene.action(/sellConfirm(?=_)/, async (ctx) => {
  const [, itemId] = ctx.match.input.split('_');
  const item = ctx.session.character.inventory.getItem(itemId);
  if (!item) return;

  const { name, price } = arena.items[item.code];

  await ctx.editMessageText(
    `Вы действительно хотите продать _${name}_ (${price / 2} 💰)?`,
    {
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback('Да', `sell_${itemId}`),
          Markup.button.callback('Нет', `itemInfo_${itemId}`),
        ],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

inventoryScene.action(/sell(?=_)/, async (ctx) => {
  const [, itemId] = ctx.match.input.split('_');

  await ctx.session.character.sellItem(itemId);

  await ctx.editMessageText(
    'Предмет успешно продан!',
    Markup.inlineKeyboard([Markup.button.callback('Назад', 'inventoryBack')]),
  );
});

inventoryScene.action('back', async (ctx) => {
  await ctx.scene.reenter();
});

inventoryScene.hears('🔙 В лобби', async (ctx) => {
  await ctx.scene.leave();
  await ctx.scene.enter('lobby');
});
