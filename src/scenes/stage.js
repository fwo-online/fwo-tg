const Stage = require('telegraf/stage');
const greeter = require('./greeter');
const select = require('./select');
const create = require('./create');
const lobby = require('./lobby');

const stage = new Stage();
const { leave } = Stage;

stage.command('cancel', leave());

// Scene registration
stage.register(greeter);
stage.register(select);
stage.register(create);
stage.register(lobby);

module.exports = stage;
