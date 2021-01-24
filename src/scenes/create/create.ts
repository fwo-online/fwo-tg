import { Scenes } from 'telegraf';
import type { Prof } from '../../data/profs';
import type { BotContext } from '../../fwo';
import { keyboards } from './keyboards';
import { messages } from './messages';

export type CreateBotContext = BotContext & {
  session: {
    prof: Prof;
  }
}

export const create = new Scenes.BaseScene<CreateBotContext>('create');

create.enter((ctx) => {
  ctx.reply(
    messages.enter,
    keyboards.create,
  );
});

create.action('create', (ctx) => {
  ctx.editMessageText(
    messages.create,
    keyboards.profButtons,
  );
});

create.action(/select(?=_)/, (ctx) => {
  const [, prof] = ctx.match.input.split('_') as [string, Prof];

  ctx.session.prof = prof;
  ctx.editMessageText(
    messages.select(prof),
    keyboards.select,
  );
});

create.action('select', async (ctx) => {
  await ctx.editMessageText(messages.selectDone, keyboards.empty);
  ctx.scene.enter('setNick');
});

create.action('back', async (ctx) => {
  await ctx.editMessageText(
    messages.back,
    keyboards.profButtons,
  );
});
