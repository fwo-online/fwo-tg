const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');

const { leave } = Stage;
const lobby = new Scene('lobby');

lobby.enter(({ reply }) => reply('Лобби! Отсюда можно выйти /exit'));

lobby.command('/exit', ({ scene }) => {
  leave();
  scene.enter('greeter');
});


module.exports = lobby;
