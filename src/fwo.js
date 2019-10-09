const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const db = require('./models')
const { leave } = Stage


// DB connection

db.connection.on('open',() => console.log('db online'))
const bot = new Telegraf(process.env.BOT_TOKEN);

const greeter = new Scene('greeter')
greeter.enter(({reply}) => reply('бла бла бла, сраный путник, бла бла бла. Выбери персонажа или создай нового', Markup
    .keyboard(['Выбрать', 'Создать'])
    .oneTime()
    .resize()
    .extra()
))
greeter.hears('Выбрать', ({scene}) => {
    leave();
    scene.enter('select')
})
greeter.hears('Создать', ({scene}) => {
    leave();
    scene.enter('create')
})


const create = new Scene('create')
const charDescr = {
    'Лучник': 'ахуенный',
    'Маг': 'волшебный',
    'Воин': 'стронг',
    'Лекарь': 'хилит'
}
let selectedRole = null;
const selectRole = (reply) => reply('Вот тебе 4 кнопки.', Markup
    .keyboard(['Маг','Лучник', 'Воин', 'Лекарь'])
    .oneTime()
    .resize()
    .extra()
)
create.enter(({reply}) => selectRole(reply))

create.on('text', ({reply, message}) => {
    if (message.text.match(/Лучник|Воин|Маг|Лекарь/gi)) {
        selectedRole = message.text;
        reply(`Ты выбрал класс ${message.text}. ${message.text} – ${charDescr[message.text]}. Выбрать или вернуться назад?`, Markup
            .keyboard(['Выбрать','Назад'])
            .oneTime()
            .resize()
            .extra()
        );
    }
    if (message.text.match(/Выбрать/gi)) {
        reply(`Твой класс — ${selectedRole}. Дальше ничего нет. Можешь не пытаться.`, Markup
            .keyboard(['/start'])
            .oneTime()
            .resize()
            .extra()
        );
    }
    if (message.text.match(/Назад/gi)) {
        selectRole(reply);
    }
})

const select = new Scene('select')
select.enter(({reply}) => reply('Тут ничего нет.', Markup
    .keyboard(['/todo'])
))
select.command('todo', ({reply}) => reply('TODO'))

const stage = new Stage()
stage.command('cancel', leave())

// Scene registration
stage.register(greeter)
stage.register(select)
stage.register(create)
bot.use(session())
bot.use(stage.middleware())
bot.start(({scene}) => scene.enter('greeter'))
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'))
bot.command('create', (ctx) => ctx.scene.enter('create'))
bot.command('select', (ctx) => ctx.scene.enter('select'))
bot.launch()
