const _ = require('lodash');
const floatNumber = require('./floatNumber');

/**
 * Класс для хранения stats
 */
class StatsService {
  /**
   * Конструктор класса stats
   * @param {Object} obj обьект параметров
   */
  constructor(obj) {
    // дефольные параметры
    // балванка
    this.inRound = {};
    // хранение всех статов тут
    this.defStat = obj || {};
    // собранные в результате раундов exp/gold ( + данные для статист)
    this.collect = ({ exp: 0, gold: 0 });
    this.refresh();
    return this;
  }

  /**
   * Функция изменения атрибута
   * @param {'up' | 'down' | 'set'} type тип изменения up/down
   * @param {string} atr изменяемый атрибут atk/hark.str/def
   * @param {number} val значение на которое будет изменено
   * изменение может происходить только внутри inRound
   */
  mode(type, atr, val) {
    let a = this.inRound[atr];
    if (a === undefined) {
      // eslint-disable-next-line no-console
      console.error('mode atr error', atr);
      this.inRound[atr] = 0;
    }
    if (typeof a === 'object') {
      a = this.inRound[atr].max;
    }
    switch (type) {
      case 'up':
        this.inRound[atr] = floatNumber(a + val);
        break;
      case 'down':
        this.inRound[atr] = floatNumber(a - val);
        break;
      case 'set':
        if (atr === 'hit') {
          a = floatNumber(a * val);
        } else {
          a = floatNumber(val);
          this.inRound[atr] = a;
        }
        break;
      default:
        // eslint-disable-next-line no-console
        console.error('Stats mode type error', type);
        throw new Error('stat mode fail');
    }
    // eslint-disable-next-line no-console
    console.log('new stat:', this.inRound[atr], 'atr', atr, 'val', val);
  }

  /**
   * Функция обнуления состояние inRound Object
   */
  refresh() {
    const oldData = _.clone(this.inRound); // ссылаемся на внешний обьект
    if (oldData.exp) {
      this.collect.exp += +oldData.exp;
    }
    this.inRound = _.clone(this.defStat);
    // выставляем ману и хп на начало раунда
    this.inRound.hp = oldData.hp || this.defStat.maxHp; // @todo hardcord
    this.inRound.mp = oldData.mp || this.defStat.maxMp; // @todo hardcord
    this.inRound.en = oldData.en || this.defStat.maxEn;
    this.inRound.exp = 0; // кол-во Exp на начало раунда
    this.inRound.def = 0; // кол-во дефа на начало
    this.inRound.dex = oldData.dex || this.defStat.dex; // кол-во ловкости на начало
  }

  /**
   * Функция возвращающее значение атрибута
   * @param {String} atr str/atk/prt/dex
   * @return {Number}
   */
  val(atr) {
    const a = this.inRound[atr];
    if (typeof a === 'number') {
      return floatNumber(a);
    }
    return a;
  }

  /**
   * Добавление голда игроку
   * @param {Number} n кол-во gold
   */
  addGold(n = 0) {
    this.collect.gold += +n;
  }
}

module.exports = StatsService;
