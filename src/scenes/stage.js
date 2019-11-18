const Stage = require('telegraf/stage');
const greeter = require('./greeter');
const create = require('./create');
const lobby = require('./lobby');
const setNick = require('./setNick');
const profile = require('./profile');
const battleScene = require('./battle');
const inventoryScene = require('./inventory');

const stage = new Stage();
const { leave } = Stage;

// Глобальная команда выхода из сцен
stage.command('cancel', leave());
// Scene registration
stage.register(greeter);
stage.register(create);
stage.register(lobby);
stage.register(setNick);
stage.register(profile);
stage.register(battleScene);
stage.register(inventoryScene);

module.exports = stage;
