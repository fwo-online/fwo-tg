const MM = require('./MatchMakingService');

MM.start();

global.arena = {};
global.arena.games = {};
global.arena.games.init = 'fwo';
module.exports = {
  mm: MM,
};
