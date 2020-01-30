const MM = require('./MatchMakingService');

MM.start();

global.arena = {};

/** @type Object<string, import ('./CharacterService')> */
const characters = {};
/** @type Object<string, import ('./GameService')> */
const games = {};

module.exports = {
  mm: MM, characters, games,
};
