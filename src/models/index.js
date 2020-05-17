const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const CharModel = require('./character');
// eslint-disable-next-line no-unused-vars
const GameModel = require('./games');
// eslint-disable-next-line no-unused-vars
const InventoryModel = require('./inventory');

mongoose.connect(
  'mongodb://duser:IeK7ijooh6aizie7@ds011903.mlab.com:11903/fwo',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
  },
  // eslint-disable-next-line no-console
).catch((e) => console.log(e));
module.exports = mongoose;
