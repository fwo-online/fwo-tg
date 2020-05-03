const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const ClanService = require('../arena/ClanService');
const { charDescr } = require('../arena/MiscService');

const clanScene = new Scene('clan');

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
    const { clan } = session.character;
    const isAdmin = clan.owner.tgId === session.character.tgId;

    replyWithMarkdown(
      `*${clan.name}*`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Список учасников', 'players_list'),
        Markup.callbackButton('Казна', 'add_gold'),
        Markup.callbackButton('Удалить клан', 'remove', !isAdmin),
      ]).resize().extra(),
    );
  }
});

clanScene.action(/add(?=_)/, async ({
  session, editMessageText, match, answerCbQuery,
}) => {
  const [, gold] = match.input.split('_');
  const { clan } = session.character;

  if (!Number.isNaN(Number(gold))) {
    try {
      await ClanService.addGold(clan, session.character, Number(gold));
      answerCbQuery(`Списано ${gold}💰`);
    } catch (e) {
      answerCbQuery(e);
    }
  }

  editMessageText(
    `В казне ${session.character.clan.gold}💰
Пополнить казну:`,
    Markup.inlineKeyboard([
      ...[10, 25, 50, 100].map((val) => Markup.callbackButton(val, `add_${val}`)),
      Markup.callbackButton('Назад', 'back'),
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

clanScene.action('remove', async ({ editMessageText, scene, session }) => {
  await ClanService.removeClan(session.character.clan);
  await editMessageText('Клан был удалён');
  scene.reenter();
});

clanScene.action('clan_list', async ({ editMessageText }) => {
  const clans = await ClanService.getClanList();
  const message = clans.map((clan) => `*${clan.name}* (👥${clan.players.length})`);
  editMessageText(
    `Список доступных кланов:
${message.join('\n')}`,
    Markup.inlineKeyboard([
      Markup.callbackButton('Назад', 'back'),
    ]).resize().extra(),
  );
});

clanScene.action('create', ({ scene }) => {
  scene.enter('createClan');
});

clanScene.action('back', ({ scene }) => {
  scene.reenter();
});

clanScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

module.exports = clanScene;
