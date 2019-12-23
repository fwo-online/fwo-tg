const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');

const { leave } = Stage;
const skillsScene = new Scene('skills');


skillsScene.enter(async ({ replyWithMarkdown }) => {
  await replyWithMarkdown(
    '*Умения*',
    Markup.keyboard([
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
});

skillsScene.hears('🔙 В лобби', ({ scene }) => {
  leave();
  scene.enter('lobby');
});

module.exports = skillsScene;
