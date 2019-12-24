const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');
const SkillService = require('../arena/SkillService');

const { leave } = Stage;
const skillsScene = new Scene('skills');

const getSkillButtons = (list, char) => Object
  .keys(list)
  .map((skill) => {
    const { name } = SkillService.show(skill);
    return [Markup.callbackButton(
      `${name} ${char.skills[name] || ''}`,
      `info_${name}`,
    )];
  });

skillsScene.enter(async ({ replyWithMarkdown, reply, session }) => {
  await replyWithMarkdown(
    '*Умения*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
  await reply(
    'Твои умения',
    Markup.inlineKeyboard([
      ...getSkillButtons(session.character.skills, session.character),
      [
        Markup.callbackButton(
          'Учить',
          'list',
        ),
        Markup.callbackButton(
          'В профиль',
          'exit',
        ),
      ],
    ]).resize().extra(),
  );
});

skillsScene.action('skills', async ({ editMessageText, session }) => {
  await editMessageText(
    'Твои умения',
    Markup.inlineKeyboard([
      ...getSkillButtons(session.character.skills, session.character),
      [
        Markup.callbackButton(
          'Учить',
          'list',
        ),
        Markup.callbackButton(
          'В профиль',
          'exit',
        ),
      ],
    ]).resize().extra(),
  );
});

skillsScene.action('list', ({ editMessageText, session }) => {
  editMessageText(
    'Доступные умения',
    Markup.inlineKeyboard([
      ...getSkillButtons(SkillService.skills, session.character),
      [Markup.callbackButton(
        'Назад',
        'skills',
      )],
    ]).resize().extra(),
  );
});

skillsScene.action(/info(?=_)/, ({ editMessageText, session, match }) => {
  const [, skill] = match.input.split('_');
  const { name, desc, lvl } = SkillService.show(skill);

  editMessageText(
    `${name} (${session.character.skills[name] || 'Не изучено'})

${desc}

Уровень умения: ${lvl}
Очков для изучения: ${session.character.bonus}`,
    Markup.inlineKeyboard([
      [Markup.callbackButton(
        `${session.character.skills[name] ? 'Повысить уровень' : 'Учить'}`,
        `learn_${skill}`,
      )],
      [Markup.callbackButton(
        'Назад',
        'list',
      )],
    ]).resize().extra(),
  );
});

skillsScene.action(/learn(?=_)/, ({
  editMessageText,
  answerCbQuery,
  session,
  match,
}) => {
  const [, skill] = match.input.split('_');
  const { name, desc, lvl } = SkillService.show(skill);
  try {
    SkillService.learn(session.character.id, skill);
    answerCbQuery(`Изучено умение ${name}`);
    editMessageText(
      `${name} (${session.character.skills[name] || 'Не изучено'})

${desc}

Уровень умения: ${lvl}
Очков для изучения: ${session.character.bonus}`,
      Markup.inlineKeyboard([
        [Markup.callbackButton(
          `${session.character.skills[name] ? 'Повысить уровень' : 'Учить'}`,
          `learn_${skill}`,
        )],
        [Markup.callbackButton(
          'Назад',
          'list',
        )],
      ]).resize().extra(),
    );
  } catch (e) {
    answerCbQuery(e.message);
  }
});

skillsScene.action('exit', ({ scene }) => {
  scene.enter('profile');
});

skillsScene.hears('🔙 В лобби', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

module.exports = skillsScene;
