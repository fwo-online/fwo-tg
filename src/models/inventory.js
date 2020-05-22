
const mongoose = require('mongoose');
const _ = require('lodash');
const arena = require('../arena');
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
 */

const inventory = new Schema({
  code: { type: String, required: true },
  wear: { type: String, required: true },
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
   * fullHarks
   *
   * @desc Возвращает  суммарный обьект всех суммирующихся характеристик от
   * одетых вещей внутри инвентаря чара
   * @param {Number} charId Идентификатор чара чей inventory нужно пропарсить
   * @return {Promise<Object>}
   * @todo нужна фунция которая выбирает коды всех одеты вещей в инвентаре
   * а затем суммирует все полученные данны в единый обьект.
   *
   * */
  async fullHarks(charId) {
    try {
      // берем из базы все надетые вещи
      const allItems = await this.getPutOned(charId);
      // Складываем все характеристики от вещей в одоин общий обьект
      return _.reduce(allItems, (ob, i) => {
        // берем характеристики вещи
        const f = this.model('Item').getHarks(i.code);
        // делаем слияние общего обьекта и обьекта вещи
        return _.assignInWith(ob, f, (objValue, srcValue) => {
          // Если в общем обтекте в этом ключе НЕ пустое значине
          if (!_.isEmpty(objValue) || _.isNumber(objValue)) {
            // и если этот ключ обьекта является Обьектом
            if (_.isObject(objValue)) {
              // то складываем два этих обьекта
              _.assignInWith(objValue, srcValue, (o, s) => +o + +s);
              return objValue;
            }
            // если ключ не является Обьектом, складываем значения
            return +objValue + +srcValue;
          }
          // Если в общем обьекте пустое значение, то берем значение вещи
          return srcValue;
        });
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
    return _.filter(invObj, { putOn: true });
  },

  /**
   * addItem
   *
   * @description Функция добавления итема в инвентарь
   * @param {Number} charId Идентификатор чара
   * @param {String} itemCode Код итема который следует добавить
   * @return {Promise<Object>} Обьект нового инветаря
   */
  // eslint-disable-next-line consistent-return
  async addItem(charId, itemCode) {
    const item = arena.items[itemCode];
    try {
      return await this.model('Inventory')
        .create({
          owner: charId, code: itemCode, wear: item.wear,
        });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('InventoryModel Error:', e);
    }
  },
  /**
   * delItem
   * @description Удаление итема из инвентаря чара (итем обязан быть снят)
   * @param {String} charId идентификатор чара
   * @param {string} itemId идентификатор итема в инвенторе
   * @return {Promise<Array>} Массив нового инвентаря
   */

  // eslint-disable-next-line consistent-return
  async delItem(charId, itemId) {
    try {
      const char = await this.model('Character').findById(charId);
      _.pull(char.inventory, itemId);
      await char.save();
      await this.model('Inventory').findByIdAndDelete(itemId);
      return char.inventory;
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
   * @return {Promise<Object>} Item созданный итем
   */
  async firstCreate(charObj) {
    const defItemCode = getDefaultItem(charObj.prof);

    const item = await this.addItem(charObj._id, defItemCode);
    await this.putOnItem(charObj._id, item.id);

    return item;
  },

  /**
   * putOnItem
   * @description Пытаемся одеть указанный итем.
   * @param {Number} charId ID чара
   * @param {Number} itemId Идентификатор итема внутри инвенторя пользователя
   * @return {Promise<Array>} Массив нового инвентаря
   */
  async putOnItem(charId, itemId) {
    console.log('PUT ON ITEM', charId, itemId);
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
   * @return {Promise<Array|void>} ItemObject после изменения его в базе
   */
  async putOffItem(charId, itemId) {
    return this.model('Inventory').updateOne({
      owner: charId,
      _id: itemId,
    }, {
      putOn: false,
    });
  },
  /**
   * Функция возвращает обьект ItemObj привязанному к персонажу
   * @param itemId
   * @param charId
   * @return {Promise<Array|void>}
   */
  async getItem(itemId, charId) {
    return this.model('Inventory').findOne({
      owner: charId,
    }, {
      _id: itemId,
    });
  },

  /**
   * @param {string} charId идентификатор персонажа
   * @param {string} itemId идентификатор предмета
   */
  removeItem(itemId, charId) {
    return this.model('Inventory').remove({
      owner: charId,
      _id: itemId,
    });
  },

  /**
   * Функция возвращает массив всех обьектов относящихся к персонажу
   * @param charId
   * @return {Promise<Array|void>} массив обтектов персонажа
   */
  async getItems(charId) {
    return this.model('Inventory').find({ owner: charId });
  },
  /**
   * Функция возращает имя вещи
   * @param itemCode
   * @return {String} displayName вещи
   */
  getItemName(itemCode) {
    return arena.items[itemCode].name;
  },
};

module.exports = mongoose.model('Inventory', inventory);
