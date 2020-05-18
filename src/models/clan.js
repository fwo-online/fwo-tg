const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * @typedef {Object} Clan
 * @property {string} name
 * @property {{moderated: boolean,type:string,data:Buffer}} logo
 * @property {number} gold
 * @property {number} lvl
 * @property {Object[]} requests
 * @property {Object[]} players
 * @property {Object} owner
 * @property {string} id
 * @property {number} maxPlayers
 * @property {boolean} hasEmptySlot
 *
 * @typedef {import ('mongoose').Document & Clan} ClanDocument
 */

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
  requests: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  players: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    unique: true,
  },
});

clan.virtual('maxPlayers').get(function maxPlayers() {
  return this.lvl + 1;
});

clan.virtual('hasEmptySlot').get(function hasEmptySlot() {
  return this.players.length < this.lvl + 1;
});

/**
 * @type {import ('mongoose').Model<ClanDocument>}
 * */
const model = mongoose.model('Clan', clan);

module.exports = model;
