const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

const profile = new Scene('profile');


profile.enter(async ({ replyWithMarkdown, session }) => {
  const magicSkillButton = /m|p/.test(session.character.prof) ? '✨ Магии' : '⚡️ Умения';
  await replyWithMarkdown(
    `*Твой профиль, ${session.character.nickname}*`,
    Markup.keyboard([
      ['💪 Характеристики'],
      ['🥋 Инвентарь', magicSkillButton],
      ['🔙 В лобби'],
    ]).resize().extra(),
  );
  await replyWithMarkdown(
    `Статистика:\`\`\`\n
\t\tИгр:       🎮 ${session.character.games}
\t\tУбийств:   💀 ${session.character.kills}
\t\tУровень:   🔺 ${session.character.lvl}
\t\tЗолото:    💰 ${session.character.gold}
\t\tОпыт:      📖 ${session.character.exp}
\t\tБонусы:    💡 ${session.character.bonus}\`\`\``,
  );
});

profile.hears('🥋 Инвентарь', ({ scene }) => {
  scene.enter('inventory');
});

profile.hears('💪 Характеристики', ({ scene }) => {
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
