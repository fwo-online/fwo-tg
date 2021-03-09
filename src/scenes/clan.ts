// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Scenes, Markup } from 'telegraf';
import arena from '../arena';
import ClanService from '../arena/ClanService';
import ValidationError from '../arena/errors/ValidationError';
import { Profs } from '../data';
import type { BotContext } from '../fwo';
import { ClanModel } from '../models/clan';

export const clanScene = new Scenes.BaseScene<BotContext>('clan');

const startScreen = {
  message: (clan) => `*${clan.name}*`,
  markup: (clan, isAdmin) => Markup.inlineKeyboard([
    [Markup.button.callback('Список участников', 'players_list')],
    [Markup.button.callback('Казна', 'add_gold')],
    [Markup.button.callback(`Заявки на вступление (${clan.requests.length})`, 'requests_list')],
    [Markup.button.callback(
      `Улучшить клан (-${ClanModel.lvlCost()[clan.lvl]}💰 +1👤)`,
      'lvlup',
      clan.lvl >= ClanModel.lvlCost().length,
    )],
    [Markup.button.callback('Удалить клан', 'removeConfirm', !isAdmin)],
    [Markup.button.callback('Покинуть клан', 'leave', isAdmin)],
  ]),
};

clanScene.enter(async (ctx) => {
  await ctx.replyWithMarkdown(
    '*Клан*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );

  ctx.session.character = arena.characters[ctx.session.character.id];

  if (!ctx.session.character.clan) {
    ctx.replyWithMarkdown(
      'Сейчас ты не состоишь ни в одном клане',
      Markup.inlineKeyboard([
        Markup.button.callback('Создать клан', 'create'),
        Markup.button.callback('Вступить в клан', 'clanlist'),
      ]),
    );
  } else {
    const clan = await ClanService.getClanById(ctx.session.character.clan.id);
    Object.assign(ctx.session.character.clan, clan);

    const isAdmin = clan.owner.tgId === ctx.session.character.tgId;

    ctx.replyWithMarkdown(
      startScreen.message(clan),
      startScreen.markup(clan, isAdmin),
    );
  }
});

clanScene.action(/^(lvlup|back|remove|leave)$/, async (ctx) => {
  const char = ctx.session.character;
  if (ctx.match.input === 'remove') {
    await ClanService.removeClan(char.clan.id);
    await ctx.answerCbQuery('Клан был удалён');
  }
  if (ctx.match.input === 'leave') {
    ctx.session.character = await ClanService.leaveClan(char.clan.id, char.tgId);
  }

  if (!ctx.session.character.clan) {
    ctx.editMessageText(
      'Сейчас ты не состоишь ни в одном клане',
      {
        parse_mode: 'Markdown',
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback('Создать клан', 'create'),
          Markup.button.callback('Вступить в клан', 'clanlist'),
        ]),
      },
    );
  } else {
    ctx.session.character = arena.characters[ctx.session.character.id];
    const clan = await ClanService.getClanById(ctx.session.character.clan.id);
    if (ctx.match.input === 'lvlup') {
      const cost = ClanModel.lvlCost()[clan.lvl];
      try {
        const updated = await clan.levelUp(clan.id);
        arena.clans[clan.id] = updated;
        ctx.answerCbQuery(`Клан достиг ${clan.lvl} уровня. Списано ${cost}💰`);
      } catch (e) {
        if (e instanceof ValidationError) {
          return ctx.answerCbQuery(e.message);
        }
        throw e;
      }
    }

    const isAdmin = clan.owner.tgId === ctx.session.character.tgId;

    ctx.editMessageText(
      startScreen.message(clan),
      startScreen.markup(clan, isAdmin),
    );
  }
});

clanScene.action('removeConfirm', (ctx) => {
  ctx.editMessageText(
    'Вы действительно хотите удалить клан?',
    Markup.inlineKeyboard([
      Markup.button.callback('Да', 'remove'),
      Markup.button.callback('Нет', 'back'),
    ]),
  );
});

clanScene.action(/add(?=_)/, async (ctx) => {
  const [, gold] = ctx.match.input.split('_');
  const clan = await ClanService.getClanById(ctx.session.character.clan.id);

  if (!Number.isNaN(Number(gold))) {
    try {
      await ClanService.addGold(clan.id, ctx.session.character.id, Number(gold));
      ctx.answerCbQuery(`Списано ${gold}💰`);
    } catch (e) {
      ctx.answerCbQuery(e.message);
    }
  }

  ctx.editMessageText(
    `В казне ${clan.gold}💰
Пополнить казну:`,
    Markup.inlineKeyboard([
      [10, 25, 50, 100, 250].map((val) => Markup.button.callback(val.toString(), `add_${val}`)),
      [Markup.button.callback('Назад', 'back')],
    ]),
  );
});

clanScene.action('players_list', async (ctx) => {
  const clan = await ClanService.getClanById(ctx.session.character.clan.id);
  const list = clan.players.map((player) => {
    const { nickname, prof, lvl } = player;
    return `${player.id === clan.owner.id ? '👑 ' : ''}*${nickname}* (${Profs.profsData[prof].icon}${lvl})`;
  });
  ctx.editMessageText(
    `Список участников:
${list.join('\n')}`,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Назад', 'back')],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

clanScene.action(/requests_list|(accept|reject)(?=_)/, async (ctx) => {
  const [action, tgId] = ctx.match.input.split('_') as [string, number];
  const clan = await ClanService.getClanById(ctx.session.character.clan.id);
  try {
    if (action === 'accept') {
      await ClanService.acceptRequest(clan.id, tgId);
    }
    if (action === 'reject') {
      await ClanService.rejectRequest(clan.id, tgId);
    }
  } catch (e) {
    ctx.answerCbQuery(e.message);
  }

  const isAdmin = clan.owner.tgId === ctx.session.character.tgId;

  const list = clan.requests.map((player) => {
    const { nickname, prof, lvl } = player;
    return [
      Markup.button.callback(`${nickname} (${Profs.profsData[prof].icon}${lvl})`, 'todo'),
      Markup.button.callback('Принять', `accept_${player.tgId}`, !isAdmin),
      Markup.button.callback('Отклонить', `reject_${player.tgId}`, !isAdmin),
    ];
  });
  ctx.editMessageText(
    'Список заявок:',
    {
      ...Markup.inlineKeyboard([
        ...list,
        [Markup.button.callback('Назад', 'back')],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

clanScene.action(/clanlist|request(?=_)/, async (ctx) => {
  const [, id] = ctx.match.input.split('_');
  if (id) {
    try {
      await ClanService.handleRequest(ctx.session.character.id, id);
    } catch (e) {
      ctx.answerCbQuery(e.message);
    }
  }

  const list = await ClanService.getClanList(ctx.session.character.id);

  ctx.editMessageText(
    'Список доступных кланов:',
    {
      ...Markup.inlineKeyboard([
        ...list,
        [Markup.button.callback('Назад', 'back')],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

clanScene.action('create', async (ctx) => {
  await ctx.deleteMessage();
  ctx.scene.enter('createClan');
});

clanScene.hears('🔙 В лобби', (ctx) => {
  ctx.scene.enter('lobby');
});
