/**
 * Item.js
 *
 * @description :: Модель итема поля
 * TODO: добавить полям требуемые типы данных, для проверки при вводе
 * @see        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const _ = require('lodash');
const fs = require('fs');
const arena = require('./index');
const ItemService = require('../arena/ItemService');

arena.items = {};

module.exports = {

  attributes: {
    code: {
      type: 'string', unique: true, required: true, dominant: true,
    },
    name: {
      type: 'string',
    },
    atc: {
      type: 'string',
    },
    prt: {
      type: 'string',
    },
    price: {
      type: 'string',
    },
    wear: {
      type: 'string',
    },
    race: {
      type: 'string',
    },
    weight: {
      type: 'string',
    },
    gskill: {
      type: 'string',
    },
    gprice: {
      type: 'string',
    },
    wcomb: {
      type: 'string',
    },
    hark: {
      type: 'string',
    },
    plushark: {
      type: 'string',
    },
    mga: {
      type: 'string',
    },
    mgp: {
      type: 'string',
    },
    hl: {
      type: 'string',
    },
    r_fire: {
      type: 'string',
    },
    r_acid: {
      type: 'string',
    },
    r_lighting: {
      type: 'string',
    },
    r_frost: {
      type: 'string',
    },
    r_physical: {
      type: 'string',
    },
    chance: {
      type: 'string',
    },
    descr: {
      type: 'string',
    },
    add_hp: {
      type: 'string',
    },
    add_mp: {
      type: 'string',
    },
    add_en: {
      type: 'string',
    },
    onlymake: {
      type: 'string',
    },
    subclass: {
      type: 'string',
    },
    reg_hp: {
      type: 'string',
    },
    reg_en: {
      type: 'string',
    },
    reg_mp: {
      type: 'string',
    },
    hp_drain: {
      type: 'string',
    },
    mp_drain: {
      type: 'string',
    },
    en_drain: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    hit: {
      type: 'string',
    },
    edinahp: {
      type: 'string',
    },
    eff: {
      type: 'string',
    },
    hide: {
      type: 'string',
    },
    wtype: {
      type: 'string',
    },
    '2handed': {
      type: 'string',
    },
    case: {
      type: 'string',
    },
    fire: {
      type: 'string',
    },
    acid: {
      type: 'string',
    },
    lighting: {
      type: 'string',
    },
    frost: {
      type: 'string',
    },
  }, /**
   * Load/reload
   * @description Функция подгрузки итемов в память (global.arena.items)
   *
   */
  async load() {
    const timer1 = Date.now();
    try {
      const items = await Item.find({});
      if (!_.isEmpty(items)) {
        arena.items = _.keyBy(items, 'code');
      } else {
        let shopArr = fs.readFileSync('shop.json', 'utf8');
        shopArr = JSON.parse(shopArr);
        // eslint-disable-next-line no-console
        console.log('File Loaded: ', Date.now() - timer1, 'ms');
        _.forEach(shopArr, async (o, code) => {
          o.code = code;
          await Item.create(o);
          return true;
        });
        arena.items = _.keyBy(items, 'code');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      // eslint-disable-next-line no-console
      console.log('Items loaded.T:', Date.now() - timer1, 'ms');
    }
  }, /**
   * @description Собираем все харки со шмотки
   * @param {String} itemCode код вещи
   * @return {Object}
   */
  getHarks(itemCode) {
    const { parseAttr } = ItemService.itemAtrParser(arena.items[itemCode]);
    return parseAttr;
  },
};
