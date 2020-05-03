const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const ClanService = require('../arena/ClanService');
const { charDescr } = require('../arena/MiscService');

const clanScene = new Scene('clan');

const startScreen = {
  message: (clan) => `*${clan.name}*`,
  markup: (clan, isAdmin) => Markup.inlineKeyboard([
    [Markup.callbackButton('Список учасников', 'players_list')],
    [Markup.callbackButton('Казна', 'add_gold')],
    [Markup.callbackButton(`Заявки на вступление (${clan.requests.length})`, 'requests_list')],
    [Markup.callbackButton(
      `Улучшить клан (-${ClanService.lvlCost[clan.lvl]}💰 +1👤)`,
      'lvlup',
      clan.lvl >= ClanService.lvlCost.length,
    )],
    [Markup.callbackButton('Удалить клан', 'remove', !isAdmin)],
  ]).resize().extra({ parse_mode: 'Markdown' }),
};

clanScene.enter(async ({ replyWithMarkdown, session }) => {
  await replyWithMarkdown(
    '*Клан*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );

  if (!session.character.clan) {
    replyWithMarkdown(
      'Сейчас ты не состоишь ни в одном клане',
      Markup.inlineKeyboard([
        Markup.callbackButton('Создать клан', 'create'),
        Markup.callbackButton('Вступить в клан', 'clan_list'),
      ]).resize().extra(),
    );
  } else {
    const clan = await ClanService.getClanById(session.character.clan.id);
    console.log(clan.maxPlayers);
    session.character.clan = clan;

    const isAdmin = clan.owner.tgId === session.character.tgId;

    replyWithMarkdown(
      startScreen.message(clan),
      startScreen.markup(clan, isAdmin),
    );
  }
});

clanScene.action(/lvlup|back/, async ({
  session, answerCbQuery, match, editMessageText,
}) => {
  if (!session.character.clan) {
    editMessageText(
      'Сейчас ты не состоишь ни в одном клане',
      Markup.inlineKeyboard([
        Markup.callbackButton('Создать клан', 'create'),
        Markup.callbackButton('Вступить в клан', 'clan_list'),
      ]).resize().extra({
        parse_mode: 'Markdown',
      }),
    );
  } else {
    const clan = await ClanService.getClanById(session.character.clan.id);
    if (match.input === 'lvlup') {
      const cost = ClanService.lvlCost[clan.lvl];
      try {
        await ClanService.levelUp(clan.id);
        answerCbQuery(`Клан достиг ${clan.lvl} уровня. Списано ${cost}💰`);
      } catch (e) {
        return answerCbQuery(e.message);
      }
    }

    const isAdmin = clan.owner.tgId === session.character.tgId;

    editMessageText(
      startScreen.message(clan),
      startScreen.markup(clan, isAdmin),
    );
  }
});

clanScene.action(/add(?=_)/, async ({
  session, editMessageText, match, answerCbQuery,
}) => {
  const [, gold] = match.input.split('_');
  const clan = await ClanService.getClanById(session.character.clan.id);

  if (!Number.isNaN(Number(gold))) {
    try {
      await ClanService.addGold(clan.id, session.character.id, Number(gold));
      answerCbQuery(`Списано ${gold}💰`);
    } catch (e) {
      answerCbQuery(e.message);
    }
  }

  editMessageText(
    `В казне ${clan.gold}💰
Пополнить казну:`,
    Markup.inlineKeyboard([
      [10, 25, 50, 100, 250].map((val) => Markup.callbackButton(val, `add_${val}`)),
      [Markup.callbackButton('Назад', 'back')],
    ]).resize().extra(),
  );
});

clanScene.action('players_list', async ({ session, editMessageText }) => {
  const { id } = session.character;
  const { players } = session.character.clan;
  const list = players.map((player) => {
    const { nickname, prof, lvl } = player;
    const { icon } = Object.values(charDescr).find((el) => el.prof === prof);
    return `${player.id === id ? '👑 ' : ''}*${nickname}* (${icon}${lvl})`;
  });
  editMessageText(
    `Список участников:
${list.join('\n')}`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'back'),
    ]).resize().extra({ parse_mode: 'Markdown' }),
  );
});

clanScene.action('requests_list', async ({ session, editMessageText }) => {
  const { id } = session.character.clan;
  const clan = await ClanService.getClanById(id);
  const list = clan.requests.map((player) => {
    const { nickname, prof, lvl } = player;
    const { icon } = Object.values(charDescr).find((el) => el.prof === prof);
    return [
      Markup.callbackButton(`${nickname} (${icon}${lvl})`, 'todo'),
      Markup.callbackButton('Принять', `accept_${player.id}`),
      Markup.callbackButton('Отклонить', `reject_${player.id}`),
    ];
  });
  editMessageText(
    'Список заявок:',
    Markup.inlineKeyboard([
      ...list,
      [Markup.callbackButton('Назад', 'back')],
    ]).resize().extra({ parse_mode: 'Markdown' }),
  );
});

clanScene.action('remove', async ({ editMessageText, scene, session }) => {
  await ClanService.removeClan(session.character.clan.id);
  await editMessageText('Клан был удалён');
  scene.reenter();
});

clanScene.action('clan_list', async ({ editMessageText }) => {
  const clans = await ClanService.getClanList();
  const buttons = clans.map((clan) => [
    Markup.callbackButton(
      `${clan.name} (👥${clan.players.length} / ${clan.maxPlayers})`,
      `info_${clan.id}`,
    ),
    Markup.callbackButton(
      `${clan.hasEmptySlot ? 'Вступить' : 'Нет места'}`,
      `request_${clan.id}`,
    ),
  ]);

  editMessageText(
    'Список доступных кланов:',
    Markup.inlineKeyboard([
      ...buttons,
      [Markup.callbackButton('Назад', 'back')],
    ]).resize().extra({ parse_mode: 'Markdown' }),
  );
});

clanScene.action(/request(?=_)/, async ({ session, answerCbQuery, match }) => {
  const [, id] = match.input.split('_');
  const clan = await ClanService.getClanById(id);
  if (clan.hasEmptySlot) {
    await ClanService.createRequest(clan.id, session.character.id);
    answerCbQuery('Заявка на вступление отправлена');
  } else {
    answerCbQuery('Клан уже сформирован');
  }
});

clanScene.action('create', async ({ scene, deleteMessage }) => {
  await deleteMessage();
  scene.enter('createClan');
});

clanScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

module.exports = clanScene;
