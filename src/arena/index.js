const MM = require('./MatchMakingService');
MM.start();

global.arena = {};
module.exports = {
  mm: MM,
};
