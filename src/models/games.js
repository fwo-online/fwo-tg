const mongoose = require('mongoose');

const { Schema } = mongoose;

const games = new Schema({
  gameId: {
    type: Number, index: true,
  },
  players: {
    type: Array,
  },
});

module.exports = mongoose.model('Games', games);
