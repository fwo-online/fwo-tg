const attack = require('./attack');
const { default: handsHeal } = require('./handsHeal');
const protect = require('./protect');
const regeneration = require('./regen');

module.exports = {
  attack,
  protect,
  regeneration,
  handsHeal,
};
