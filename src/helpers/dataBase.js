/**
 * MongoHelper
 *
 */
const CharModel = require('../models/character');

function dbErr(e) {
  throw new Error('Fail in dbHelper:', e);
}

module.exports = {
  char: {
    // eslint-disable-next-line consistent-return
    async find(tgId) {
      try {
        return await CharModel.findOne({ tgId, deleted: false });
      } catch (e) {
        dbErr(e);
      }
    },
    async save(charObj) {
      try {
        // @todo проверка на родителя и целостность обьекта
        await CharModel.save(charObj);
      } catch (e) {
        dbErr(e);
      }
    },
    async remove(tgId) {
      try {
        await CharModel.findOneAndUpdate({ tgId, deleted: false }).save();
      } catch (e) {
        dbErr(e);
      }
    },
    // eslint-disable-next-line consistent-return
    async create(charObj) {
      try {
        return await CharModel.create({ charObj }).save();
      } catch (e) {
        dbErr(e);
      }
    },
    /*
    @param Nick string имя персонажа
     */
    async findNick(nickname) {
      try {
        await CharModel.findOne({ nickname, deleted: false });
      } catch (e) {
        dbErr(e);
      }
    },
  },
};
