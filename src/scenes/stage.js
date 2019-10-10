const Stage = require('telegraf/stage');
const greeter = require('./greeter');
const select = require('./select');
const create = require('./create');

const stage = new Stage();
const { leave } = Stage;

stage.command('cancel', leave());

// Scene registration
stage.register(greeter);
stage.register(select);
stage.register(create);

module.exports = stage;
