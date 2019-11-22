const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('../arena/config');

const { Schema } = mongoose;

/**
 * getDefaultItem
 * @param {String} prof ID профы w/l/m/p
 * @return {String} itemCode код дефолтного итема для данной профы
 * @description Получаем код дефолтного итема для данной профы
 *
 */
function getDefaultItem(prof) {
  // eslint-disable-next-line no-console
  return config.defaultItems[prof] || console.log('no prof in getDefaultItem');
}

/**
 * Inventory
 *
 * @description Модель инвентаря чара
 * @module Model/Inventory
 * @todo нужно переработать
 */

const inventory = new Schema({
  code: { type: String, required: true },
  name: { type: String, default: '' },
  putOn: { type: Boolean, default: false },
  durable: { type: Number, default: 10 },
  // Добавляем связь инвенторя с персонажем charID
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
  },
});

inventory.statics = {
  /**
   * getAllHarks
   *
   * @desc Возвращает  суммарный обьект всех суммирующихся характеристик от
   * одетых вещей внутри инвентаря чара
   * @param {Number} charId Идентификатор чара чей inventory нужно пропарсить
   * @return {Object}
   * @todo нужна фунция которая выбирает коды всех одеты вещей в инвентаре
   * а затем суммирует все полученные данны в единый обьект.
   *
   * */
  async fullHarks(charId) {
    try {
      const allItems = await this.getPutOned(charId);
      return _.reduce(allItems, (ob, i) => {
        const f = this.model('Item').getHarks(i.code);
        return _.merge(ob, f);
      }, {});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('fail in harks', e);
      return false;
    }
  }, /**
   * Возвращает массив одетых вещей в инвентаре
   * @param {Number} charId
   * @return {Promise<Array>} [item,item,item]
   */
  async getPutOned(charId) {
    const invObj = await this.model('Inventory').find({ owner: charId });
    return _.filter(invObj.items, { putOn: true });
  },

  /**
   * addItem
   *
   * @description Функция добавления итема в инвентарь
   * @param {Number} charId Идентификатор чара
   * @param {String} itemCode Код итема который следует добавить
   * @return {Promise<Array>} Обьект нового инветаря
   * @todo на входе должно быть 2 параметра charId && itemCode
   */
  async addItem(charId, itemCode) {
    const char = await this.model('Character').findById(charId);
    const item = await this.model('Inventory')
      .create({ owner: charId, code: itemCode });
    char.inventory.push(item);
    await char.save();
    return char.inventory;
  },
  /**
   * delItem
   * @description Удаление итема из инвентаря чара (итем обязан быть снят)
   * @param {String} charId идентификатор чара
   * @param {string} itemId идентификатор итема в инвенторе
   * @return {Array} Массив нового инвентаря
   */

  // eslint-disable-next-line consistent-return
  async delItem(charId, itemId) {
    try {
      const char = await this.model('Character').findById(charId);
      _.pull(char.inventory, itemId);
      await char.save();
      return this.model('Inventory').findByIdAndDelete(itemId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('InventoryModel Error:', e);
    }
  },

  /**
   * firstCreate
   * @description Функция заведения инвентаря
   * Данная функция нужна для создания инвенторя в момент создания чара
   * т.к инветарь не связан на прямую и для его создания нужно сначала получить
   * ownerId чара.
   * @param {Object} charObj обьект созданного чара
   * @todo переделать после допила addItem
   */
  async firstCreate(charObj) {
    const defItemCode = getDefaultItem(charObj.prof);
    return this.addItem(charObj._id, defItemCode);
  },

  /**
   * putOnItem
   * @description Пытаемся одеть указанный итем.
   * @param {Number} charId ID чара
   * @param {Number} itemId Идентификатор итема внутри инвенторя пользователя
   * @return {Array} Массив нового инвентаря
   */
  async putOnItem(charId, itemId) {
    return this.model('Inventory').updateOne({
      owner: charId,
      _id: itemId,
    }, {
      putOn: true,
    });
  },

  /**
   * putOffItem
   * @description Пытаемся снять указанный итем.
   * @param {Number} charId ID чара
   * @param {Number} itemId Идентификатор итема внутри инвенторя пользователя
   * @return {Array} Массив нового инвентаря
   * @todo переделать!
   */
  async putOffItem(charId, itemId) {
    return this.model('Inventory').updateOne({
      owner: charId,
      _id: itemId,
    }, {
      putOn: false,
    });
  },

  async getItem(itemId, charId) {
    return this.model('Inventory').findOne({
      owner: charId,
    }, {
      item: itemId,
    });
  },

  async getItems(charId) {
    return this.model('Inventory').find({ owner: charId });
  },

  getItemName(itemCode) {
    return global.arena.items[itemCode].name;
  },
};

module.exports = mongoose.model('Inventory', inventory);
