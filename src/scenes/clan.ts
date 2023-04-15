// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Scenes, Markup } from 'telegraf';
import { broadcast } from '@/helpers/channelHelper';
import arena from '../arena';
import { ClanService } from '../arena/ClanService';
import ValidationError from '../arena/errors/ValidationError';
import { Profs } from '../data';
import type { BotContext } from '../fwo';

export const clanScene = new Scenes.BaseScene<BotContext>('clan');

const startScreen = {
  message: (clan) => `*${clan.name}*`,
  markup: (clan, isAdmin) => Markup.inlineKeyboard([
    [Markup.button.callback('Список участников', 'players_list')],
    [Markup.button.callback('Казна', 'add_gold')],
    [Markup.button.callback(`Заявки на вступление (${clan.requests.length})`, 'requests_list')],
    [Markup.button.callback(
      `Улучшить клан (-${ClanService.lvlCost[clan.lvl]}💰 +1👤)`,
      'lvlup',
      clan.lvl >= ClanService.lvlCost.length,
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
    await ctx.replyWithMarkdown(
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

    await ctx.replyWithMarkdown(
      startScreen.message(clan),
      startScreen.markup(clan, isAdmin),
    );
  }
});

clanScene.action(/^(lvlup|back|remove|leave)$/, async (ctx) => {
  const char = ctx.session.character;
  try {
    if (ctx.match.input === 'remove') {
      await ClanService.removeClan(char.clan.id, char.id);
      await ctx.answerCbQuery('Клан был удалён');
    }
    if (ctx.match.input === 'leave') {
      await ClanService.leaveClan(char.clan.id, char.tgId);
    }
  } catch (e) {
    await ctx.answerCbQuery(e.message);
  }

  if (!ctx.session.character.clan) {
    await ctx.editMessageText(
      'Сейчас ты не состоишь ни в одном клане',
      {
        ...Markup.inlineKeyboard([
          Markup.button.callback('Создать клан', 'create'),
          Markup.button.callback('Вступить в клан', 'clanlist'),
        ]),
        parse_mode: 'Markdown',
      },
    );
  } else {
    ctx.session.character = arena.characters[ctx.session.character.id];
    const clan = await ClanService.getClanById(ctx.session.character.clan.id);
    if (ctx.match.input === 'lvlup') {
      const cost = ClanService.lvlCost[clan.lvl];
      try {
        const updated = await ClanService.levelUp(clan.id);
        await ctx.answerCbQuery(`Клан достиг ${updated.lvl + 1} уровня. Списано ${cost}💰`);
      } catch (e) {
        if (e instanceof ValidationError) {
          return ctx.answerCbQuery(e.message);
        }
        throw e;
      }
    }

    const isAdmin = clan.owner.tgId === ctx.session.character.tgId;

    await ctx.editMessageText(
      startScreen.message(clan),
      startScreen.markup(clan, isAdmin),
    );
  }
});

clanScene.action('removeConfirm', async (ctx) => {
  await ctx.editMessageText(
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
      await ctx.answerCbQuery(`Списано ${gold}💰`);
    } catch (e) {
      await ctx.answerCbQuery(e.message);
    }
  }

  await ctx.editMessageText(
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
  await ctx.editMessageText(
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
  const [action, charId] = ctx.match.input.split('_') as [string, string];
  const clan = await ClanService.getClanById(ctx.session.character.clan.id);
  try {
    if (action === 'accept') {
      await ClanService.acceptRequest(clan.id, charId);
      await broadcast(
        `Твоя заявка на вступление в клан *${clan.name}* была одобрена`,
        ctx.session.character.tgId,
      );
    }
    if (action === 'reject') {
      await ClanService.rejectRequest(clan.id, charId);

      await broadcast(
        `Твоя заявка на вступление в клан *${clan.name}* была отклонена`,
        ctx.session.character.tgId,
      );
    }
  } catch (e) {
    await ctx.answerCbQuery(e.message);
  }

  const isAdmin = clan.owner.tgId === ctx.session.character.tgId;

  const list = clan.requests.map((player) => {
    const { nickname, prof, lvl } = player;
    return [
      Markup.button.callback(`${nickname} (${Profs.profsData[prof].icon}${lvl})`, 'todo'),
      Markup.button.callback('Принять', `accept_${player.id}`, !isAdmin),
      Markup.button.callback('Отклонить', `reject_${player.id}`, !isAdmin),
    ];
  });
  await ctx.editMessageText(
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
      const message = await ClanService.handleRequest(id, ctx.session.character.id);
      await ctx.answerCbQuery(message);
    } catch (e) {
      return ctx.answerCbQuery(e.message);
    }
  }

  const [clans, requestedClan] = await Promise.all([
    ClanService.getClanList(),
    ClanService.getClanByPlayerRequest(ctx.session.character.id),
  ]);

  const buttons = clans.map((clan) => [
    Markup.button.callback(
      `${clan.name} (👥${clan.players.length} / ${clan.maxPlayers})`,
      `info_${clan.id}`,
    ),
    Markup.button.callback(
      `${requestedClan?.id === clan.id ? 'Отменить' : 'Вступить'}`,
      `request_${clan.id}`,
    ),
  ]);

  await ctx.editMessageText(
    'Список доступных кланов:',
    {
      ...Markup.inlineKeyboard([
        ...buttons,
        [Markup.button.callback('Назад', 'back')],
      ]),
      parse_mode: 'Markdown',
    },
  );
});

clanScene.action('create', async (ctx) => {
  await ctx.deleteMessage();
  await ctx.scene.enter('createClan');
});

clanScene.hears('🔙 В лобби', async (ctx) => {
  await ctx.scene.enter('lobby');
});
