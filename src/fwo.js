const Telegraf = require('telegraf');
const session = require('telegraf/session');
const SocksAgent = require('socks5-https-client/lib/Agent');
const db = require('./models');
const stage = require('./scenes/stage.js');
const channelHelper = require('./helpers/channelHelper');
const Item = require('./models/item');
const authMiddleware = require('./middlewares/authMiddleware');
const protectedMiddleware = require('./middlewares/protectedMiddleware');
const chatMiddleware = require('./middlewares/chatMiddleware');
const restartMiddleware = require('./middlewares/restartMiddleware');
const MM = require('./arena/MatchMakingService');
const arena = require('./arena');

// DB connection
db.connection.on('open', () => {
  // eslint-disable-next-line no-console
  console.log('db online');
  Item.load();
});

MM.start();
arena.mm = MM;

const socksAgent = new SocksAgent({
  socksHost: '45.138.156.65',
  socksPort: '15788',
  socksUsername: 'LFlvgkmY1O',
  socksPassword: 'qdahjxVbX9',
});

const bot = new Telegraf('439110772:AAEmSFtNFir2IvJv9fIzUM1td8xCh6PGOLE', {
  telegram: { agent: socksAgent },
});

bot.use(session());
bot.use(stage.middleware());
bot.use(chatMiddleware);
bot.use(authMiddleware);

bot.start(async ({ scene }) => { scene.enter('greeter'); });
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'));

bot.use(restartMiddleware);
bot.use(protectedMiddleware);

bot.use(chatMiddleware);
bot.command('profile', (ctx) => ctx.scene.enter('profile'));
bot.command('inventory', (ctx) => ctx.scene.enter('inventory'));
bot.launch();

channelHelper.bot = bot;
