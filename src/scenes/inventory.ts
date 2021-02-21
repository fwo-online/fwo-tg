import { Scenes, Markup } from 'telegraf';
import arena from '../arena';
import ItemService from '../arena/ItemService';
import type { BotContext } from '../fwo';
import { InventoryModel } from '../models/inventory';

export const inventoryScene = new Scenes.BaseScene<BotContext>('inventory');

const getInventoryItems = (items) => items.map((item) => [Markup.button.callback(
  `${item.putOn ? '✔️' : ''} ${InventoryModel.getItemName(item.code)}`,
  `itemInfo_${item._id}`,
)]);

inventoryScene.enter(async (ctx) => {
  const { items } = ctx.session.character;
  await ctx.replyWithMarkdown(
    '*Инвентарь*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );
  await ctx.reply(
    'Список вещей',
    Markup.inlineKeyboard(getInventoryItems(items)),
  );
});

inventoryScene.action('inventoryBack', async (ctx) => {
  const { items } = ctx.session.character;

  await ctx.editMessageText(
    'Список вещей',
    Markup.inlineKeyboard(getInventoryItems(items)),
  );
});

inventoryScene.action(/itemInfo(?=_)/, async (ctx) => {
  const [, itemId] = ctx.match.input.split('_');
  const item = ctx.session.character.getItem(itemId);
  if (!item) return;

  const itemDescription = ItemService.itemDescription(
    ctx.session.character,
    arena.items[item.code],
  );
  const itemAction = item.putOn ? Markup.button.callback('Снять',
    `putOff_${itemId}`) : Markup.button.callback('Надеть',
    `putOn_${itemId}`);

  ctx.editMessageText(
    `${itemDescription}`,
    {
      ...Markup.inlineKeyboard([
        [
          itemAction,
          Markup.button.callback('Продать', `sellConfirm_${itemId}`),
          Markup.button.callback('Назад', 'back'),
        ],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

inventoryScene.action(/putOff(?=_)/, async (ctx) => {
  const [, itemId] = ctx.match.input.split('_');
  await ctx.session.character.putOffItem(itemId);

  ctx.editMessageText(
    'Предмет успешно снят!',
    Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'inventoryBack'),
    ]),
  );
});

inventoryScene.action(/putOn(?=_)/, async (ctx) => {
  const [, itemId] = ctx.match.input.split('_');

  const result = await ctx.session.character.putOnItem(itemId);

  if (result) {
    ctx.editMessageText(
      'Предмет успешно надет!',
      Markup.inlineKeyboard([
        Markup.button.callback('Назад', 'inventoryBack'),
      ]),
    );
  } else {
    ctx.editMessageText(
      'Недостаточно характеристик либо на этом место уже надет предмет',
      Markup.inlineKeyboard([
        Markup.button.callback('Назад', 'inventoryBack'),
      ]),
    );
  }
});

inventoryScene.action(/sellConfirm(?=_)/, (ctx) => {
  const [, itemId] = ctx.match.input.split('_');
  const item = ctx.session.character.getItem(itemId);
  if (!item) return;

  console.log(item);
  const { name, price } = arena.items[item.code];

  ctx.editMessageText(
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

  ctx.session.character.sellItem(itemId);

  ctx.editMessageText(
    'Предмет успешно продан!',
    Markup.inlineKeyboard([
      Markup.button.callback('Назад', 'inventoryBack'),
    ]),
  );
});

inventoryScene.action('back', (ctx) => {
  ctx.scene.reenter();
});

inventoryScene.hears('🔙 В лобби', (ctx) => {
  ctx.scene.leave();
  ctx.scene.enter('lobby');
});
