const mongoose = require('mongoose');

mongoose.connect(
  'mongodb://duser:IeK7ijooh6aizie7@ds011903.mlab.com:11903/fwo',
  { useNewUrlParser: true },
).catch((e) => console.log(e));
module.exports = mongoose;
