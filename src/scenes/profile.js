const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

const profile = new Scene('profile');


profile.enter(async ({ replyWithMarkdown, session }) => {
  const { character } = session;
  const magicSkillButton = /m|p/.test(character.prof) ? '✨ Магии' : '⚡️ Умения';
  await replyWithMarkdown(
    `*Твой профиль, ${character.nickname}*`,
    Markup.keyboard([
      [`💪 Характеристики${character.free ? ' 🆙' : ''}`],
      ['🥋 Инвентарь', magicSkillButton],
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
  await replyWithMarkdown(
    `Статистика:\`\`\`\n
\t\tИгр:       🎮 ${character.games}
\t\tУбийств:   🔪 ${character.kills}
\t\tСмертей:   💀 ${character.death}
\t\tПобегов:   🏃 ${character.runs}
\t\tУровень:   🔺 ${character.lvl}
\t\tЗолото:    💰 ${character.gold}
\t\tОпыт:      📖 ${character.exp}
\t\tБонусы:    💡 ${character.bonus}\`\`\``,
  );
});

profile.hears('🥋 Инвентарь', ({ scene }) => {
  scene.enter('inventory');
});

profile.hears(/^💪 Характеристики/g, ({ scene }) => {
  scene.enter('harks');
});

profile.hears('🔙 В лобби', ({ scene }) => {
  scene.enter('lobby');
});

profile.hears('⚡️ Умения', ({ scene, session }) => {
  if (/m|p/.test(session.character.prof)) return;
  scene.enter('skills');
});

profile.hears('✨ Магии', ({ scene, session }) => {
  if (!/m|p/.test(session.character.prof)) return;
  scene.enter('magics');
});

module.exports = profile;
