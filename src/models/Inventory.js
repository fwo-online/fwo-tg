/**
 * Inventory
 *
 * @description Модель инвентаря чара
 * @module Model/Inventory
 * @todo нужно переработать
 */
module.exports = {

  attributes: {
    items: {
      type: 'JSON', defaultsTo: {},
    },

    // Добавляем связь инвенторя с персонажем
    // charID
    owner: {
      model: 'character', required: true,
    },
  }, /**
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
  getAllHarks: async(charId) => {
    try {
      let allItems = await Inventory.getPutOned(charId);
      return allItems.reduce((ob, i) => {
        let f = Item.getHarks(i.code);
        return Object.assign(ob, f);
      }, {});
    } catch (e) {
      sails.log.error('fail in harks', e);
    }
  }, /**
   * Возвращает массив одетых вещей в инвентаре
   * @param {Number} charId
   * @return {Promise<Array>} [item,item,item]
   */
  getPutOned: async(charId) => {
    let invObj = await Inventory.findOne({owner: charId}) || {};
    return invObj.items.filter(el => el['putOn'] === true);
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
  addItem: async(charId, itemCode) => {
    let invObj = await Inventory.findOne({
      owner: charId,
    });
    // Проверка на наличие итема в базе
    await Item.findOne({
      code: itemCode,
    });
    let items = invObj.items;
    let keys = Object.keys(items);
    let lastKey = keys[keys.length - 1] || -1;
    items[+lastKey + 1] = {
      code: itemCode, putOn: false, durable: {
        val: 10, default: 10,
      }, stack: false, val: 1,
    };
    return await Inventory.update({
      owner: charId,
    }, {
      items: items,
    });
  },

  /**
   * delItem
   * @description Удаление итема из инвентаря чара (итем обязан быть снят)
   * @param {Number} charId идентификатор чара
   * @param {Number} slotId идентификатор итема в инвенторе
   * @return {Array} Массив нового инвентаря
   * @todo сделать!
   */

  delItem: async(charId, slotId) => {
    let inv = await Inventory.findOne({
      'owner': charId,
    });
    delete(inv.items[slotId]);
    return await Inventory.update({
      'owner': charId,
    }, {
      items: inv.items,
    });
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
  firstCreate: async(charId, prof) => {
    await Inventory.create({
      owner: charId,
    });
    let defItemCode = getDefaultItem(prof);
    await Inventory.addItem(charId, defItemCode);
    await Inventory.putOnItem(charId, 0);
  }, /**
   * putOnItem
   * @description Пытаемся одеть указанный итем.
   * @param {Number} charId ID чара
   * @param {Number} slotId Идентификатор итема внутри инвенторя пользователя
   * @return {Array} Массив нового инвентаря
   */
  putOnItem: async(charId, slotId) => {
    let inv = await Inventory.findOne({
      'owner': charId,
    });
    inv.items[slotId].putOn = true;
    return await Inventory.update({
      'owner': charId,
    }, {
      items: inv.items,
    });
  }, /**
   * putOffItem
   * @description Пытаемся снять указанный итем.
   * @param {Number} charId ID чара
   * @param {Number} slotId Идентификатор итема внутри инвенторя пользователя
   * @return {Array} Массив нового инвентаря
   * @todo переделать!
   */
  putOffItem: async(charId, slotId) => {
    let inv = await Inventory.findOne({
      'owner': charId,
    });
    inv.items[slotId].putOn = false;
    return await Inventory.update({
      'owner': charId,
    }, {
      items: inv.items,
    });
  },
};

/**
 * getDefaultItem
 * @param {String} prof ID профы w/l/m/p
 * @return {String} itemCode код дефолтного итема для данной профы
 * @description Получаем код дефолтного итема для данной профы
 *
 */
function getDefaultItem(prof) {
  return sails.config.arena.defaultItems[prof] ||
    sails.log.error('no prof in getDefaultItem');
}
