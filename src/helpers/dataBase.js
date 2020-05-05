/**
 * MongoHelper
 */
const CharModel = require('../models/character');
const GameModel = require('../models/games');
const InventoryModel = require('../models/inventory');
const ClanModel = require('../models/clan');

function dbErr(e) {
  throw new Error(`Fail in dbHelper: ${e}`);
}

/**
 * @typedef {import ('../models/clan').ClanDocument} ClanDocument
 * @typedef {import ('../models/clan').Clan} Clan
 */

module.exports = {
  char: {
    // eslint-disable-next-line consistent-return
    async find(query) {
      try {
        const x = await CharModel.findOne({ ...query, deleted: false });
        if (x) {
          // eslint-disable-next-line no-underscore-dangle
          x._doc.id = x._id;
          // eslint-disable-next-line no-underscore-dangle
          return x._doc;
        }
        return x;
      } catch (e) {
        dbErr(e);
      }
    },
    /**
     * Загрузка чара из базы
     * @param query
     * @return {Promise<any|{}>}
     */
    // eslint-disable-next-line consistent-return
    async load(query) {
      try {
        const x = await CharModel.findOne({ ...query, deleted: false })
          .populate('inventory')
          .populate({
            path: 'clan',
            populate: { path: 'owner' },
          })
          .populate({
            path: 'clan',
            populate: { path: 'players' },
          });
        if (x) {
          x.id = x._id;
        }
        return x;
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
        return await CharModel.findOneAndUpdate({ tgId, deleted: false },
          { deleted: true });
      } catch (e) {
        dbErr(e);
      }
    },
    // eslint-disable-next-line consistent-return
    /**
     * Создание персонажа
     * @param charObj
     * @return {Promise<CharacterData|void>}
     */
    async create(charObj) {
      try {
        const char = await CharModel.create(charObj);
        const item = await InventoryModel.firstCreate(char);
        await this.update(char.tgId, { inventory: [item] });
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
        // eslint-disable-next-line no-underscore-dangle
        return x._doc;
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
    // eslint-disable-next-line consistent-return
    async getItems(charId) {
      try {
        return await InventoryModel.getItems(charId);
      } catch (e) {
        dbErr(e);
      }
    },
    async putOffItem(charId, itemId) {
      return InventoryModel.putOffItem(charId, itemId);
    },
    async putOnItem(charId, itemId) {
      return InventoryModel.putOnItem(charId, itemId);
    },
    async getItem(itemCode, charId) {
      return InventoryModel.getItem(itemCode, charId);
    },
    async removeItem(itemId, charId) {
      return InventoryModel.removeItem(itemId, charId);
    },
    async addItem(charId, itemCode) {
      return InventoryModel.addItem(charId, itemCode);
    },
  },
  clan: {
    /**
     * Создаёт новый клан
     * @param {string} owner - id создателя клана
     * @param {string} name - название клана
     * @returns {Promise<Clan>}
     */
    async create(owner, name) {
      try {
        const clan = new ClanModel({
          owner,
          name,
          players: [owner],
        });
        await clan.save();

        return clan;
      } catch (e) {
        dbErr(e);
      }
    },
    /**
     * Возвращает клан по query
     * @param {Partial<ClanDocument>} query
     * @returns {Promise<Clan>}
     */
    async findOne(query) {
      try {
        return await ClanModel
          .findOne(query)
          .populate('owner')
          .populate('requests')
          .populate('players');
      } catch (e) {
        dbErr(e);
      }
    },
    /**
     * Возвращает список всех кланов
     * @returns {Promise<Clan[]>}
     */
    async list() {
      try {
        return await ClanModel.find();
      } catch (e) {
        dbErr(e);
      }
    },
    /**
     * Ищет название клана в базе без учёта регистра
     * @param {string} name - название клана
     * @returns {Promise<boolean>}
     */
    async findName(name) {
      try {
        return await ClanModel.exists({ name: { $regex: name, $options: 'i' } });
      } catch (e) {
        dbErr(e);
      }
    },
    /**
     * @param {string} clanId - id клана
     * @param {Partial<Clan>} params - параметры, которые требуется обновить
     * @returns {Promise<Clan>}
     */
    async update(clanId, params) {
      try {
        return await ClanModel
          .findByIdAndUpdate(clanId, params, { new: true })
          .populate('owner')
          .populate('requests')
          .populate('players');
      } catch (e) {
        dbErr(e);
      }
    },
    /**
     * @param {string} clanId - id клана
     */
    async remove(clanId) {
      try {
        return await ClanModel.deleteOne({ _id: clanId });
      } catch (e) {
        dbErr(e);
      }
    },
  },
};
