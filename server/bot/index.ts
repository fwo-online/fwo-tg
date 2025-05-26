import { Bot, InlineKeyboard } from 'grammy';
import * as loginHelper from '@/helpers/loginHelper';
import { getInvoice } from '@/api/invoice';
import { createPayment } from '@/api/payment';
import { InvoiceType } from '@fwo/shared';
import { CharacterService } from '@/arena/CharacterService';
import { ServiceShop } from '@/arena/ServiceShop';
import { BOT_CHAT_ID } from '@/helpers/channelHelper';
import type { ChatMember } from 'grammy/types';
import { hasCharacter } from '@/api/character';
import arena from '@/arena';
import { createWolf } from '@/arena/MonsterService/monsters/wolf';

const bot = new Bot(process.env.BOT_TOKEN ?? '', {
  client: { environment: process.env.NODE_ENV === 'development' ? 'test' : 'prod' },
});

bot.command('start', async (ctx) => {
  if (!ctx.from || ctx.chat?.type !== 'private') {
    return;
  }

  const character = await loginHelper.getChar(ctx.from.id);
  if (character) {
    const keyboard = new InlineKeyboard().webApp('Открыть', `${process.env.APP_URL}`);
    await ctx.reply(
      `Здравствуй, ${character.nickname}. Вот кнопка, чтобы отправиться в приключение`,
      { reply_markup: keyboard },
    );
  } else {
    const keyboard = new InlineKeyboard().webApp('Создать', `${process.env.APP_URL}`);
    await ctx.reply(
      `Здравствуй, сраный путник. Я вижу ты здесь впервые. 
    Бла бла бла.Вот кнопка, чтобы создать персонажа.`,
      { reply_markup: keyboard },
    );
  }
});

bot.command('help', async (ctx) => {
  if (!ctx.from || ctx.chat?.type !== 'private') {
    return;
  }

  ctx.reply('https://telegra.ph/Fight-Wold-Online-Help-11-05');
});

bot.command('monsters', async (ctx) => {
  if (!ctx.from) {
    return;
  }
  const lvl = Number.parseInt(ctx.match);
  if (Number.isNaN(lvl)) {
    return;
  }

  const { status } = await ctx.getChatMember(ctx.from?.id);

  if (!['administrator', 'creator'].includes(status)) {
    return;
  }

  if (lvl) {
    arena.monsters.wolf = await createWolf(lvl);
    ctx.reply(`Создан монстр ${lvl} уровня`);
  } else {
    arena.monsters = {};
    ctx.reply('Монстры отключены');
  }
});

bot.on('pre_checkout_query', async (ctx) => {
  console.log('pre_checkout_query:: ', ctx.preCheckoutQuery.invoice_payload);
  try {
    await getInvoice(ctx.preCheckoutQuery.invoice_payload);
    await ctx.answerPreCheckoutQuery(true);
  } catch {
    await ctx.answerPreCheckoutQuery(false, { error_message: 'Что-то пошло не так' });
  }
});

bot.on(':successful_payment', async (ctx) => {
  console.log('successful_payment:: ', ctx.message?.successful_payment.invoice_payload);
  const invoice = await getInvoice(ctx.message?.successful_payment.invoice_payload);

  await createPayment({
    invoice,
    amount: ctx.message?.successful_payment.total_amount,
    currency: ctx.message?.successful_payment.currency,
    payload: ctx.message?.successful_payment.invoice_payload,
    user: ctx.from?.id,
  });

  const character = await CharacterService.getCharacter(invoice.user.toString());

  switch (invoice.invoiceType) {
    case InvoiceType.ResetAttributes:
      await ServiceShop.resetAttributes(character);
      return;
    case InvoiceType.ChangeName:
      await ServiceShop.changeName(character, invoice.payload);
      return;
  }
});

bot.on(':refunded_payment', async (ctx) => {
  console.log(
    'refunded_payment:: ',
    ctx.message?.successful_payment?.invoice_payload,
    ' from: ',
    ctx.message?.from.id,
  );
  const invoice = await getInvoice(ctx.message?.refunded_payment.invoice_payload);

  const character = await CharacterService.getCharacter(invoice.user.toString());
  await character.remove();
});

const knownIDs = new Set<number>();

bot.on('message', async (ctx) => {
  if (ctx.chat.id.toString() !== BOT_CHAT_ID.toString()) {
    return;
  }

  if (knownIDs.has(ctx.from?.id)) {
    return;
  }

  const userHasCharacter = await checkUserHasCharacter(ctx.from?.id);

  if (userHasCharacter) {
    knownIDs.add(ctx.from?.id);
    return;
  }

  await ctx.deleteMessage();
  await ctx.reply(
    `[${ctx.from.first_name}](tg://user?id=${ctx.from.id}), зарегистрируй персонажа в @FightWorldBot, чтобы получить доступ к чату`,
    {
      parse_mode: 'MarkdownV2',
    },
  );
});

export const initBot = () => {
  return bot.start();
};

export const checkUserHasCharacter = async (userID: string | number) => {
  return await hasCharacter({ owner: userID });
};

export const checkUserIsChannelMember = async (userID: string | number) => {
  const allowedStatuses: ChatMember['status'][] = ['administrator', 'creator', 'member'];

  try {
    const { status } = await bot.api.getChatMember(BOT_CHAT_ID, Number(userID));

    return allowedStatuses.includes(status);
  } catch (e) {
    return false;
  }
};

export { bot };
