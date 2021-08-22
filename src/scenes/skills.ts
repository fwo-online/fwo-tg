import { Scenes, Markup } from 'telegraf';
import ValidationError from '../arena/errors/ValidationError';
import SkillService, { SkillsNames } from '../arena/SkillService';
import type { BotContext } from '../fwo';

export const skillsScene = new Scenes.BaseScene<BotContext>('skills');

const getSkillButtons = (list, char) => Object
  .keys(list)
  .filter((skill) => SkillService.skills[skill].profList[char.prof])
  .map((skill) => {
    const { displayName } = SkillService.skills[skill];
    return [Markup.button.callback(
      `${displayName} ${char.skills[skill] ? `(${char.skills[skill]})` : ''}`,
      `info_${skill}`,
    )];
  });

skillsScene.enter(async (ctx) => {
  await ctx.replyWithMarkdown(
    '*Умения*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize(),
  );
  await ctx.reply(
    'Твои умения',
    Markup.inlineKeyboard([
      ...getSkillButtons(ctx.session.character.skills, ctx.session.character),
      [
        Markup.button.callback(
          'Учить',
          'list',
        ),
        Markup.button.callback(
          'В профиль',
          'exit',
        ),
      ],
    ]),
  );
});

skillsScene.action('skills', async (ctx) => {
  const charSkillButtons = getSkillButtons(ctx.session.character.skills, ctx.session.character);
  await ctx.editMessageText(
    `Твои умения${charSkillButtons.length ? '' : '\nСейчас у тебя не изучено ни одного умения'}`,
    Markup.inlineKeyboard([
      ...charSkillButtons,
      [
        Markup.button.callback(
          'Учить',
          'list',
        ),
        Markup.button.callback(
          'В профиль',
          'exit',
        ),
      ],
    ]),
  );
});

skillsScene.action('list', (ctx) => {
  ctx.editMessageText(
    'Доступные умения',
    Markup.inlineKeyboard([
      ...getSkillButtons(SkillService.skills, ctx.session.character),
      [Markup.button.callback(
        'Назад',
        'skills',
      )],
    ]),
  );
});

skillsScene.action(/info(?=_)/, (ctx) => {
  const [, skill] = ctx.match.input.split('_') as [string, SkillsNames];
  ctx.editMessageText(
    SkillService.skillDescription(skill, ctx.session.character),
    Markup.inlineKeyboard([
      [Markup.button.callback(
        `${ctx.session.character.skills[skill] ? 'Повысить уровень' : 'Учить'}`,
        `learn_${skill}`,
      )],
      [Markup.button.callback(
        'Назад',
        'list',
      )],
    ]),
  );
});

skillsScene.action(/learn(?=_)/, async (ctx) => {
  const [, skill] = ctx.match.input.split('_') as [string, SkillsNames];
  const { displayName } = SkillService.skills[skill];
  try {
    ctx.session.character = await SkillService.learn(ctx.session.character, skill);

    ctx.answerCbQuery(`Изучено умение ${displayName}`);
    ctx.editMessageText(
      SkillService.skillDescription(skill, ctx.session.character),
      Markup.inlineKeyboard([
        [Markup.button.callback(
          `${ctx.session.character.skills[skill] ? 'Повысить уровень' : 'Учить'}`,
          `learn_${skill}`,
        )],
        [Markup.button.callback(
          'Назад',
          'list',
        )],
      ]),
    );
  } catch (e) {
    if (e instanceof ValidationError) {
      ctx.answerCbQuery(e.message);
    } else {
      throw e;
    }
  }
});

skillsScene.action('exit', ({ scene }) => {
  scene.enter('profile');
});

skillsScene.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});
