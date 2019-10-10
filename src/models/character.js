const mongoose = require('mongoose');

const { Schema } = mongoose;

const character = new Schema({
  tgid: {
    type: Number, index: true, unique: true, required: true,
  },
  nickname: {
    type: String, index: true, unique: true, required: true,
  },
  birthdate: { type: Date, default: Date.now },
  prof: { type: String, default: 'w' },
  exp: { type: Number, default: 0 },
  str: { type: Number, default: 0 },
  dex: { type: Number, default: 0 },
  wis: { type: Number, default: 0 },
  int: { type: Number, default: 0 },
  con: { type: Number, default: 6 },
  gold: { type: Number, default: 100 },
  free: { type: Number, default: 10 },
  weapon: { type: Object, default: {} },
  lvl: { type: Number, default: 1 },
  sex: { type: String, default: 'm' },
  kills: { type: Number, default: 0 },
  lastfight: { type: Date, default: null },
  death: { type: Number, default: 0 },
  inventory: { type: Object, default: [] },
  psr: { type: Number, default: 1500 },
  mag: { type: Object, default: {} },
  bonus: { type: Number, default: 0 },
  skills: { type: Object, default: {} },
  clan: { type: String, default: null },
  panel: { type: Object, default: {} },
});


module.exports = mongoose.model('Character', character);
