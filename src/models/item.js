const _ = require('lodash');
const fs = require('fs');
const mongoose = require('mongoose');
const forEach = require('lodash.foreach');
const config = require('../arena/config');
const ItemService = require('../arena/ItemService');

const { Schema } = mongoose;

/**
 * Item
 *
 * @description Модель предмета
 * @module Model/Item
 */

const item = new Schema({
  code: {
    type: String, unique: true, required: true, dominant: true,
  },
  name: {
    type: String,
  },
  atc: {
    type: String,
  },
  prt: {
    type: String,
  },
  price: {
    type: String,
  },
  wear: {
    type: String,
  },
  race: {
    type: String,
  },
  weight: {
    type: String,
  },
  gskill: {
    type: String,
  },
  gprice: {
    type: String,
  },
  wcomb: {
    type: String,
  },
  hark: {
    type: String,
  },
  plushark: {
    type: String,
  },
  mga: {
    type: String,
  },
  mgp: {
    type: String,
  },
  hl: {
    type: String,
  },
  r_fire: {
    type: String,
  },
  r_acid: {
    type: String,
  },
  r_lighting: {
    type: String,
  },
  r_frost: {
    type: String,
  },
  r_physical: {
    type: String,
  },
  chance: {
    type: String,
  },
  descr: {
    type: String,
  },
  add_hp: {
    type: String,
  },
  add_mp: {
    type: String,
  },
  add_en: {
    type: String,
  },
  onlymake: {
    type: String,
  },
  subclass: {
    type: String,
  },
  reg_hp: {
    type: String,
  },
  reg_en: {
    type: String,
  },
  reg_mp: {
    type: String,
  },
  hp_drain: {
    type: String,
  },
  mp_drain: {
    type: String,
  },
  en_drain: {
    type: String,
  },
  type: {
    type: String,
  },
  hit: {
    type: String,
  },
  edinahp: {
    type: String,
  },
  eff: {
    type: String,
  },
  hide: {
    type: String,
  },
  wtype: {
    type: String,
  },
  '2handed': {
    type: String,
  },
  case: {
    type: String,
  },
  fire: {
    type: String,
  },
  acid: {
    type: String,
  },
  lighting: {
    type: String,
  },
  frost: {
    type: String,
  },
});

item.statics = {
  /**
   * Load/reload
   * @description Функция подгрузки итемов в память (global.arena.items)
   *
   */
  async load() {
    const timer1 = Date.now();
    try {
      const items = await this.model('Item').find({});
      if (Object.entries(items).length) {
        global.arena.items = _.keyBy(items, 'code');
      } else {
        let shopArr = fs.readFileSync('shop.json', 'utf8');
        shopArr = JSON.parse(shopArr);
        // eslint-disable-next-line no-console
        console.log('File Loaded: ', Date.now() - timer1, 'ms');

        forEach(shopArr, async (o, code) => {
          try {
            o.code = code;
            await this.model('Item').create(o);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
          }
          return true;
        });
        global.arena.items = _.keyBy(items, 'code');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      // eslint-disable-next-line no-console
      console.log('Items loaded.T:', Date.now() - timer1, 'ms');
    }
  },
  /**
   * @description Собираем все харки со шмотки
   * @param {String} itemCode код вещи
   * @return {Object}
   */
  getHarks(itemCode) {
    const itemObj = ItemService.itemAtrParser(global.arena.items[itemCode]);
    return _.pick(itemObj, config.parseAttr);
  },
};

module.exports = mongoose.model('Item', item);
