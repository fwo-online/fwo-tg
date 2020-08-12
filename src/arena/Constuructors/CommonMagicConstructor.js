const { default: Magic } = require('./MagicConstructor');

/**
 * @typedef {import ('./MagicConstructor').Magic} baseMag
 */

/**
 * Общий конструктор не длительных магий
 */
class CommonMagic extends Magic {
  /**
   * Создание магии
   * @param {baseMag} magObj Обьект создаваемой магии
   */
  constructor(magObj) {
    super(magObj);
    this.status = {};
  }
}

module.exports = CommonMagic;
