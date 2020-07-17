
const _ = require('lodash');
const { BaseScene, Markup } = require('telegraf');
const arena = require('../arena');
const ItemService = require('../arena/ItemService');
const { stores } = require('../arena/MiscService');

/** @type {import('./stage').BaseGameScene} */
const shopScene = new BaseScene('shopScene');

const storeKeys = Object.keys(stores);

/**
 * Возвращет кнопки по всем типам вещей из stores
 * @returns {array}
 */
const getTypeButtons = () => storeKeys.map((type) => [Markup.callbackButton(
  `${stores[type]}`,
  `itemType_${type}`,
)]);

/**
 * Возвращает предметы по выбранному типу.
 * Не показывает вещи, которые не подходят персонажу по профессии
 * @param {string} wear - тип вещей (куда надевается)
 * @param {string} prof - профессия персонажа
 * @returns {array}
 */
const getItems = (wear, prof) => {
  const items = _.filter(arena.items, { wear });
  const buttons = items
    .filter((item) => item.race.includes(prof) && !item.onlymake && item.hide === '0')
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
      getTypeButtons(),
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

shopScene.action('back', ({ editMessageText }) => {
  editMessageText(
    'Список товаров',
    Markup.inlineKeyboard(getTypeButtons()).resize().extra(),
  );
});

shopScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

shopScene.action('inventory', ({ scene }) => {
  scene.enter('inventory');
});

module.exports = shopScene;
