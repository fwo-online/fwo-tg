const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');

const greeter = new Scene('greeter');
const { leave } = Stage;
greeter.enter(({ reply }) => reply(
  'бла бла бла, сраный путник, '
    + 'бла бла бла. Выбери персонажа или создай нового',
  Markup.keyboard(['Выбрать', 'Создать']).oneTime().resize().extra(),
));
greeter.hears('Выбрать', ({ scene }) => {
  leave();
  scene.enter('select');
});
greeter.hears('Создать', ({ scene }) => {
  leave();
  scene.enter('create');
});

module.exports = greeter;
