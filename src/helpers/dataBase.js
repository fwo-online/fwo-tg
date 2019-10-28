/**
 * MongoHelper
 *
 */
const CharModel = require('../models/character');
const GameModel = require('../models/games');
const InventoryModel = require('../models/inventory');

function dbErr(e) {
  throw new Error('Fail in dbHelper:', e);
}

module.exports = {
  char: {
    // eslint-disable-next-line consistent-return
    async find(obj) {
      try {
        return await CharModel.findOne({ ...obj, deleted: false });
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
    // eslint-disable-next-line consistent-return
    async remove(tgId) {
      try {
        return await CharModel.findOneAndRemove({ tgId });
      } catch (e) {
        dbErr(e);
      }
    },
    // eslint-disable-next-line consistent-return
    async create(charObj) {
      try {
        const x = new CharModel(charObj);
        x.save();
        return x;
      } catch (e) {
        dbErr(e);
      }
    },
    /*
    @param Nick string имя персонажа
     */
    // eslint-disable-next-line consistent-return
    async findNick(nickname) {
      try {
        return await CharModel.findOne({ nickname, deleted: false });
      } catch (e) {
        dbErr(e);
      }
    },
    // eslint-disable-next-line consistent-return
    async update(tgId, params) {
      try {
        return await CharModel.findOneAndUpdate({ tgId, deleted: false }, params);
      } catch (e) {
        dbErr(e);
      }
    },
  },
  game: {
    // eslint-disable-next-line consistent-return
    async create(gameObject) {
      try {
        const x = new GameModel(gameObject);
        x.save();
        return x;
      } catch (e) {
        dbErr(e);
      }
    },
  },
  inventory: {
    // eslint-disable-next-line consistent-return
    async getAllHarks(charId) {
      try {
        return await InventoryModel.fullHarks(charId);
      } catch (e) {
        dbErr(e);
      }
    },
  },
};
