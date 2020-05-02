const mongoose = require('mongoose');

const { Schema } = mongoose;

const clan = new Schema({
  name: { type: String, required: true, unique: true },
  logo: {
    moderated: {
      type: Boolean,
      default: false,
    },
    type: String,
    data: Buffer,
  },
  gold: { type: Number, default: 0 },
  lvl: { type: Number, default: 1 },
  requests: { type: Array, default: [] },
  players: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('Clan', clan);
