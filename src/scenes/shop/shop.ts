import _ from 'lodash';
import { BaseScene, Markup } from 'telegraf';
import type { BaseGameContext } from '../stage';
import * as messages from './messages';
import * as keyboards from './keyboards';

const shopScene = new BaseScene<BaseGameContext>('shopScene');

shopScene.enter(async ({ reply, replyWithMarkdown }) => {
  await replyWithMarkdown(
    '*Магазин*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
  await reply(
    messages.enter(),
    keyboards.enter(),
  );
});

shopScene.action(/itemType(?=_)/, async ({ session, editMessageText, match }) => {
  if (_.isNil(match)) return;
  const [, type] = match.input.split('_');

  editMessageText(
    messages.itemType(type),
    keyboards.itemType(type, session.character),
  );
});

shopScene.action(/itemInfo(?=_)/, async ({ session, editMessageText, match }) => {
  if (_.isNil(match)) return;
  const [, code] = match.input.split('_');
  editMessageText(
    messages.itemInfo(code, session.character),
    keyboards.itemInfo(code),
  );
});

shopScene.action(/buy(?=_)/, async ({
  session,
  editMessageText,
  answerCbQuery,
  match,
}) => {
  if (_.isNil(match)) return;
  const [, code] = match.input.split('_');
  const result = await session.character.buyItem(code);

  if (!result) {
    answerCbQuery(messages.noGold());
  } else {
    editMessageText(
      messages.buy(code, session.character),
      keyboards.buy(code),
    );
  }
});

shopScene.action('collectionList', async ({ editMessageText }) => {
  editMessageText(
    messages.collectionList(),
    keyboards.collectionList(),
  );
});

shopScene.action(/collection(?=_)/, async ({ editMessageText, match }) => {
  if (_.isNil(match)) return;
  const [, key] = match.input.split('_');

  editMessageText(
    messages.collectionItem(key),
    keyboards.collectionItem(key),
  );
});

shopScene.action('back', ({ editMessageText }) => {
  editMessageText(
    messages.enter(),
    keyboards.enter(),
  );
});

shopScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

export default shopScene;
