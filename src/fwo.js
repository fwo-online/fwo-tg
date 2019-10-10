const Telegraf = require('telegraf');
const session = require('telegraf/session');
// const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const { leave } = Stage;
const Scene = require('telegraf/scenes/base');
const db = require('./models');
const CharModel = require('./models/character');

const create = require('./controllers/create');
const lobby = require('./controllers/lobby');


// DB connection

db.connection.on('open', () => console.log('db online'));
const bot = new Telegraf(process.env.BOT_TOKEN);

let isFindOne = false;
const greeter = new Scene('greeter');
greeter.enter(async ( {update, reply} ) => {
  let resp = await CharModel.findOne({tg_id: update.message.from.id})
  if (resp && resp.tg_id === update.message.from.id) {
    isFindOne = true;
    reply(
      `Здравствуй, сраный путник. Я вижу ты здесь не первый раз. 
      У тебя есть персонаж класса ${resp.prof}.
      Бла бла бла.
      Вот две кнопки. Одна удалит твоего персонажа, 
      вторая отправит его в мир`, 
      Markup.keyboard([['Войти', 'Удалить']]).oneTime().resize().extra()
    )
  } else {
    isFindOne = false;
    reply(
      `Здравствуй, сраный путник. Я вижу ты здесь впервые.
      Бла бла бла.
      Вот кнопка, чтобы создать персонажа.`, 
      Markup.keyboard(['Создать']).oneTime().resize().extra()
    )
  }
});

greeter.hears('Удалить', async ({ scene, reply, from }) => {
    let resp = await CharModel.findOneAndDelete({tg_id: from.id})
    if (resp) {
      reply (
        `Твой персонаж был удалён!`
      )
      leave();
      scene.enter('greeter');
    } else {
      reply (
        `Произошда ошибка`
      )
      leave()
      scene.enter('geeter');
    }
});

greeter.hears('Войти', ({ scene, reply }) => {
  if (!isFindOne) {
    reply('Сначала тебе нужно создать персонажа')
    leave();
    scene.enter('create');
  }
  leave();
  scene.enter('lobby');
});

greeter.hears('Создать', ({ scene }) => {
  leave();
  scene.enter('create');
});


const stage = new Stage();
// Scene registration
stage.register(greeter);
stage.register(create);
stage.register(lobby);
bot.use(session());
bot.use(stage.middleware());
bot.start(({ scene }) => scene.enter('greeter'));
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));
bot.command('create', (ctx) => ctx.scene.enter('create'));
bot.command('select', (ctx) => ctx.scene.enter('select'));
bot.command('lobby', (ctx) => ctx.scene.enter('lobby'));
bot.launch();
