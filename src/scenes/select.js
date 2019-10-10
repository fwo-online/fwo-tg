const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const Markup = require('telegraf/markup');

const { leave } = Stage;
const select = new Scene('select');


select.enter(
  ({ reply }) => reply('Тут ничего нет.', Markup.keyboard(['/todo'])),
);
select.hears('Exit', ({ scene }) => {
  leave();
  scene.enter('greeter');
});
select.command('todo', ({ reply }) => reply('TODO'));

module.exports = select;
