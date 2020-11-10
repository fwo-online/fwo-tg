const _ = require('lodash');

/**
 * @typedef {Object} historyObj
 * @property {string} initiator
 * @property {string} target
 * @property {string} dmgType
 * @property {number} dmg
 * @property {string} actionType
 * @property {number} round
*/

/**
 * Класс для хранения истории выполненных заказов
 */

class HistoryService {
  constructor() {
    /** @type {historyObj[]} */
    this.damages = [];
    /** @type {historyObj[]} */
    this.fails = [];
  }

  /**
   * @param {historyObj} dmgObj
   * @param {number} round
   */
  addDamage(dmgObj) {
    const historyObj = _.pick(dmgObj, [
      'initiator',
      'target',
      'dmgType',
      'dmg',
      'actionType',
      'round',
    ]);
    this.damages.push(historyObj);
  }

  /**
   * @param {number} round
   * @returns {historyObj[]}
   */
  getRoundDamage(round) {
    return this.damages.filter((damage) => damage.round === round);
  }
}

module.exports = HistoryService;
