const mongoose = require('mongoose');

const { Schema } = mongoose;

const character = new Schema({
  tgId: {
    type: Number, index: true, unique: true, required: true,
  },
  nickname: {
    type: String, required: true,
  },
  birthday: { type: Date, default: Date.now },
  prof: { type: String, default: 'w' },
  exp: { type: Number, default: 0 },
  harks: {
    type: Object,
    default: {
      str: 0, dex: 0, wis: 0, int: 0, con: 6,
    },
  },
  statistics: {
    type: Object,
    default: {
      games: 0,
      kills: 0,
      death: 0,
      runs: 0,
    },
  },
  gold: { type: Number, default: 100 },
  free: { type: Number, default: 10 },
  weapon: { type: Object, default: {} },
  lvl: { type: Number, default: 1 },
  sex: { type: String, default: 'm' },
  lastFight: { type: Date, default: null },
  inventory: { type: Object, default: [] },
  psr: { type: Number, default: 1500 },
  magics: { type: Object, default: {} },
  bonus: { type: Number, default: 0 },
  skills: { type: Object, default: {} },
  clan: { type: String, default: null },
  modifiers: {
    type: Object,
    default: {
      crit: 0,
      agile: 0,
      block: 0,
      luck: 0,
    },
  },
  panel: { type: Object, default: {} },
  resists: {
    type: Object,
    default: {
      ice: 0,
      fire: 0,
      light: 0,
      acid: 0,
    },
  },
  statical: {
    type: Object,
    default: {
      heal: 0,
      mp: 0,
      physDef: 0,
    },
  },
  deleted: { type: Boolean, default: false },
});


module.exports = mongoose.model('Character', character);
