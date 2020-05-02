const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const db = require('../helpers/dataBase');
// const CharacterService = require('../arena/CharacterService');

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
    replyWithMarkdown(
      `*${clan.name}*`,
      Markup.inlineKeyboard([
        Markup.callbackButton('Список учасников', 'players_list'),
        Markup.callbackButton('Удалить клан', 'remove'),
      ]).resize().extra(),
    );
  }
});

clanScene.action('players_list', async () => {
  /** @todo */
});

clanScene.action('remove', async ({ session, reply, scene }) => {
  await db.clan.remove(session.character.clan.id);
  session.character.leaveClan();
  await reply('Клан был удалён');
  scene.reenter();
});

clanScene.action('clan_list', async ({ replyWithMarkdown }) => {
  const clans = await db.clan.list();
  const message = clans.map((clan) => `*${clan.name}* (👥${clan.players.length})`);
  replyWithMarkdown(
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

clanScene.action('create', ({ scene }) => {
  scene.reenter();
});

clanScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

module.exports = clanScene;
