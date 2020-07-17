const { Stage } = require('telegraf');
const greeter = require('./greeter');
const create = require('./create');
const lobby = require('./lobby');
const setNick = require('./setNick');
const profile = require('./profile');
const battleScene = require('./battle');
const inventoryScene = require('./inventory');
const shopScene = require('./shop');
const settingScene = require('./settings');
const magicScene = require('./magics');
const harksScene = require('./harks');
const skillsScene = require('./skills');
const clanScene = require('./clan');
const createClanScene = require('./createClan');

/** @typedef {import ('telegraf').BaseScene} BaseScene */
/** @typedef {import ('telegraf/typings/stage').SceneContextMessageUpdate} SceneContextMessageUpdate */
/** @typedef {{ session: { character: import('../arena/CharacterService')}}} Session */
/** @typedef {import ('telegraf').BaseScene<SceneContextMessageUpdate & Session>} BaseGameScene */

const stage = new Stage([
  greeter,
  create,
  lobby,
  setNick,
  profile,
  inventoryScene,
  shopScene,
  settingScene,
  magicScene,
  harksScene,
  skillsScene,
  clanScene,
  createClanScene,
  battleScene,
]);
const { leave } = Stage;

// Глобальная команда выхода из сцен
stage.command('cancel', leave());
// Scene registration

module.exports = stage;
