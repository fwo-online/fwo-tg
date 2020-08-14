import _ from 'lodash';
import { BaseScene, Markup } from 'telegraf';
import arena from '../arena';
import ItemService, { attrNames } from '../arena/ItemService';
import { stores } from '../arena/MiscService';
import { collections } from '../data/collection';
import type { BaseGameContext } from './stage';
import type { Prof } from '../models/character';

const shopScene = new BaseScene<BaseGameContext>('shopScene');

const storeKeys = Object.keys(stores);

/**
 * Возвращет кнопки по всем типам вещей из stores
 */
const getTypeButtons = () => storeKeys.map((type) => [Markup.callbackButton(
  `${stores[type]}`,
  `itemType_${type}`,
)]);

/**
 * Возвращает предметы по выбранному типу.
 * Не показывает вещи, которые не подходят персонажу по профессии
 * @param wear - тип вещей (куда надевается)
 * @param prof - профессия персонажа
 */
const getItems = (wear: string, prof: Prof) => {
  const items = _.filter(arena.items, { wear });
  const buttons = items
    .filter((item) => item.race.includes(prof) && !item.onlymake && !item.hide)
    .sort((a, b) => b.price - a.price)
    .map((item) => [Markup.callbackButton(
      `${item.name} (💰 ${item.price})`,
      `itemInfo_${item.code}`,
    )]);
  buttons.push([Markup.callbackButton(
    'Назад',
    'back',
  )]);
  return buttons;
};

shopScene.enter(async ({ reply, replyWithMarkdown }) => {
  await replyWithMarkdown(
    '*Магазин*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
  await reply(
    'Список категорий товаров',
    Markup.inlineKeyboard(
      [
        ...getTypeButtons(),
        [Markup.callbackButton('Коллекции', 'collectionList')],
      ],
    ).resize().extra(),
  );
});

shopScene.action(/itemType(?=_)/, async ({ session, editMessageText, match }) => {
  const [, type] = match.input.split('_');

  editMessageText(
    `${stores[type]}`,
    Markup.inlineKeyboard(getItems(type, session.character.prof)).resize().extra(),
  );
});

shopScene.action(/itemInfo(?=_)/, async ({ session, editMessageText, match }) => {
  const [, code] = match.input.split('_');
  const item = arena.items[code];
  editMessageText(
    ItemService.itemDescription(session.character, item),
    Markup.inlineKeyboard([
      Markup.callbackButton(
        'Купить',
        `buy_${code}`,
      ),
      Markup.callbackButton(
        'Назад',
        `itemType_${item.wear}`,
      )]).resize().extra({ parse_mode: 'Markdown' }),
  );
});

shopScene.action(/buy(?=_)/, async ({
  session,
  editMessageText,
  answerCbQuery,
  match,
}) => {
  const [, code] = match.input.split('_');
  const item = arena.items[code];
  const result = await session.character.buyItem(code);

  if (!result) {
    answerCbQuery('Недостаточно голды');
  } else {
    editMessageText(
      `Ты купил предмет ${item.name}. У тебя осталось 💰 ${session.character.gold}`,
      Markup.inlineKeyboard([
        [Markup.callbackButton(
          'В инвентарь',
          'inventory',
        )],
        [Markup.callbackButton(
          'Продолжить покупки',
          `itemType_${item.wear}`,
        )],
      ]).resize().extra(),
    );
  }
});

shopScene.action('collectionList', async ({ editMessageText }) => {
  const keys = Object.keys(collections);
  const buttons = keys.map((key) => [Markup.callbackButton(collections[key].name, `collection_${key}`)]);

  editMessageText(
    'Коллекции',
    Markup.inlineKeyboard(
      buttons,
    ).resize().extra(),
  );
});

shopScene.action(/collection(?=_)/, async ({ editMessageText, match }) => {
  if (_.isNil(match)) return;
  const [, name] = match.input.split('_');
  const collection = collections[name];

  console.log(collection);

  const text = [
    collection.name,
    collection.harks && _.map(collection.harks, (val, key) => `\n${attrNames.hark[key]}: ${val}`).join(),
    collection.resists && _.map(collection.resists, (val, key) => `\n${attrNames[`r_${key}`]} : ${100 - (val ?? 0) * 100}%`).join(),
    collection.statical && _.map(collection.statical, (val, key) => `\n${attrNames[key]} : ${_.isObject(val) ? val.max : val}`).join(),
  ].filter(_.isString).join('\n');

  editMessageText(
    text,
    Markup.inlineKeyboard(
      [Markup.callbackButton('Назад', 'collectionList')],
    ).resize().extra(),
  );
});

shopScene.action('back', ({ editMessageText }) => {
  editMessageText(
    'Список категорий товаров',
    Markup.inlineKeyboard(
      [
        ...getTypeButtons(),
        [Markup.callbackButton('Коллекции', 'collectionList')],
      ],
    ).resize().extra(),
  );
});

shopScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

shopScene.action('inventory', ({ scene }) => {
  scene.enter('inventory');
});

export default shopScene;
