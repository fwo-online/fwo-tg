import { InvoiceType } from '@fwo/shared';
import { Bot, InlineKeyboard } from 'grammy';
import type { ChatMember } from 'grammy/types';
import { hasCharacter } from '@/api/character';
import { getInvoice } from '@/api/invoice';
import { createPayment } from '@/api/payment';
import { CharacterService } from '@/arena/CharacterService';
import { ClanService } from '@/arena/ClanService';
import ValidationError from '@/arena/errors/ValidationError';
import { ServiceShop } from '@/arena/ServiceShop';
import { BOT_CHAT_ID } from '@/helpers/channelHelper';
import * as loginHelper from '@/helpers/loginHelper';

const bot = new Bot(process.env.BOT_TOKEN ?? (process.env.NODE_ENV === 'test' ? 'test' : ''), {
  client: { environment: process.env.NODE_ENV === 'development' ? 'test' : 'prod' },
});

bot.catch((e) => console.error(e));

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

bot.command('clan', async (ctx) => {
  if (!ctx.from) {
    return;
  }

  const isAdmin = await chechUserIsChannelAdmin(ctx.from.id, ctx.chat.id);
  if (!isAdmin) {
    await ctx.reply('Вы не являетесь администратором канала');
    return;
  }

  try {
    const character = await CharacterService.getCharacter(ctx.from.id.toString());

    if (!character.clan) {
      await ctx.reply('Вы не состоите в клане');
      return;
    }

    const command = ctx.match;
    if (command === 'link') {
      await ClanService.updateChannel(character.clan.id, character.id, ctx.chat.id);
      await ctx.reply('Канал успешно привязян к клану');
      return;
    }

    if (command === 'unlink') {
      await ClanService.updateChannel(character.clan.id, character.id, undefined);
      await ctx.reply('Канал успешно отвязан от клана');
      return;
    }

    await ctx.reply('Неизвестная команда');
  } catch (e) {
    if (e instanceof ValidationError) {
      await ctx.reply(e.message);
    } else {
      console.error(e);
      await ctx.reply('Что-то пошло не так');
    }
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

  try {
    await ctx.deleteMessage();
  } catch {
    //
  }
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
  } catch {
    return false;
  }
};

export const chechUserIsChannelAdmin = async (userID: string | number, chatID: string | number) => {
  const allowedStatuses: ChatMember['status'][] = ['administrator', 'creator'];
  try {
    const { status } = await bot.api.getChatMember(chatID, Number(userID));

    return allowedStatuses.includes(status);
  } catch {
    return false;
  }
};

export { bot };
