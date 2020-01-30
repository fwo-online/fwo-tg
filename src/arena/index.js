const MM = require('./MatchMakingService');

MM.start();

global.arena = {};
global.arena.games = {};
global.arena.games.init = 'fwo';

/** @type Object<string, import ('./CharacterService')> */
const characters = {};

module.exports = {
  mm: MM, characters,
};
