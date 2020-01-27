const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const SkillService = require('../arena/SkillService');

const skillsScene = new Scene('skills');

const getSkillButtons = (list, char) => Object
  .keys(list)
  .filter((skill) => SkillService.skills[skill].profList.includes(char.prof))
  .map((skill) => {
    const { name } = SkillService.show(skill);
    return [Markup.callbackButton(
      `${name} ${char.skills[skill] ? `(${char.skills[skill]})` : ''}`,
      `info_${skill}`,
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
  const charSkillButtons = getSkillButtons(session.character.skills, session.character);
  await editMessageText(
    `Твои умения${charSkillButtons.length ? '' : '\nСейчас у тебя не изучено ни одного умения'}`,
    Markup.inlineKeyboard([
      ...charSkillButtons,
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
  editMessageText(
    SkillService.skillDescription(skill, session.character),
    Markup.inlineKeyboard([
      [Markup.callbackButton(
        `${session.character.skills[skill] ? 'Повысить уровень' : 'Учить'}`,
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
  editMessageText, answerCbQuery, session, match,
}) => {
  const [, skill] = match.input.split('_');
  const { name } = SkillService.show(skill);
  try {
    session.character = SkillService.learn(session.character.id, skill);

    answerCbQuery(`Изучено умение ${name}`);
    editMessageText(
      SkillService.skillDescription(skill, session.character),
      Markup.inlineKeyboard([
        [Markup.callbackButton(
          `${session.character.skills[skill] ? 'Повысить уровень' : 'Учить'}`,
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
  scene.enter('lobby');
});

module.exports = skillsScene;
