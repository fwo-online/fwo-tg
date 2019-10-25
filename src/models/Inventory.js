const mongoose = require('mongoose');
const Item = require('./item');
const { arena: { defaultItems } } = require('../arena/config');

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
  return defaultItems[prof] || console.log('no prof in getDefaultItem');
}

/**
 * Inventory
 *
 * @description Модель инвентаря чара
 * @module Model/Inventory
 * @todo нужно переработать
 */

const inventory = new Schema({
  items: {
    type: Object, defaultsTo: {},
  },

  // Добавляем связь инвенторя с персонажем
  // charID
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'character',
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
  async getAllHarks(charId) {
    try {
      const allItems = await this.getPutOned(charId);
      return allItems.reduce((ob, i) => {
        const f = Item.getHarks(i.code);
        return Object.assign(ob, f);
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
    const invObj = await this.model('Inventory').findOne({ owner: charId });
    return invObj.items ? invObj.items.filter((el) => el.putOn === true) : this.firstCreate(charId, 'l');
  },

  /**
   * addItem
   *
   * @description Функция добавления итема в инвентарь
   * @param {Number} charId Идентификатор чара
   * @param {String} itemCode Код итема который следует добавить
   * @return {Array} Обьект нового инвентаря
   * @todo на входе должно быть 2 параметра charId && itemCode
   */
  async addItem(charId, itemCode) {
    const invObj = await this.model('Inventory').findOne({
      owner: charId,
    });
    // Проверка на наличие итема в базе
    await this.model('Item').findOne({
      code: itemCode,
    });
    const { items } = invObj;
    const keys = Object.keys(items);
    const lastKey = keys[keys.length - 1] || -1;
    items[+lastKey + 1] = {
      code: itemCode,
      putOn: false,
      durable: {
        val: 10, default: 10,
      },
      stack: false,
      val: 1,
    };
    const resp = await this.model('Inventory').update({
      owner: charId,
    }, {
      items,
    });
    return resp;
  },

  /**
   * delItem
   * @description Удаление итема из инвентаря чара (итем обязан быть снят)
   * @param {Number} charId идентификатор чара
   * @param {Number} slotId идентификатор итема в инвенторе
   * @return {Array} Массив нового инвентаря
   * @todo сделать!
   */

  async delItem(charId, slotId) {
    const inv = await this.model('Inventory').findOne({
      owner: charId,
    });
    delete (inv.items[slotId]);
    const resp = await this.model('Inventory').update({
      owner: charId,
    }, {
      items: inv.items,
    });
    return resp;
  },

  /**
   * firstCreate
   * @description Функция заведения инвентаря
   * Данная функция нужна для создания инвенторя в момент создания чара
   * т.к инветарь не связан на прямую и для его создания нужно сначала получить
   * ownerId чара.
   * @param {Number} charId идентификатор чара
   * @param {String} prof идентификатор итема в инвенторе
   * @todo переделать после допила addItem
   */
  async firstCreate(charId, prof) {
    await this.model('Item').load();
    await this.create({
      owner: charId,
    });
    const defItemCode = getDefaultItem(prof);
    await this.addItem(charId, defItemCode);
    await this.putOnItem(charId, 0);
  }, /**
   * putOnItem
   * @description Пытаемся одеть указанный итем.
   * @param {Number} charId ID чара
   * @param {Number} slotId Идентификатор итема внутри инвенторя пользователя
   * @return {Array} Массив нового инвентаря
   */
  async putOnItem(charId, slotId) {
    const inv = await this.model('Inventory').findOne({
      owner: charId,
    });
    inv.items[slotId].putOn = true;
    const resp = await this.model('Inventory').update({
      owner: charId,
    }, {
      items: inv.items,
    });
    return resp;
  }, /**
   * putOffItem
   * @description Пытаемся снять указанный итем.
   * @param {Number} charId ID чара
   * @param {Number} slotId Идентификатор итема внутри инвенторя пользователя
   * @return {Array} Массив нового инвентаря
   * @todo переделать!
   */
  async putOffItem(charId, slotId) {
    const inv = await this.model('Inventory').findOne({
      owner: charId,
    });
    inv.items[slotId].putOn = false;
    const resp = await this.model('Inventory').update({
      owner: charId,
    }, {
      items: inv.items,
    });
    return resp;
  },
};
module.exports = mongoose.model('Inventory', inventory);
