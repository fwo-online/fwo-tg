// import Magic from './MagicConstructor';
const Magic = require('./MagicConstructor');
/**
 * Общий конструктор не длительных магий
 */
class CommonMagic extends Magic {
  /**
   * Создание магии
   * @param {Object} magObj Обьект создаваемой магии
   * @param {String} name Имя магии
   * @param {String} desc Короткое описание
   * @param {Number} cost Стоимость за использование
   * @param {String} costType Тип единицы стоимости {en/mp}
   * @param {Number} lvl Требуемый уровень круга магий для использования
   * @param {String} orderType Тип цели заклинания self/team/enemy/enemyTeam
   * @param {String} aoeType Тип нанесения урона по цели:
   * target/targetAoe/all/allNoinitiator/team/self
   * @param {String} magType Тип магии good/bad/neutral
   * @param {String} effect размер рандомного эффект от магии
   */
  constructor(magObj) {
    super(magObj);
    this.status = {};
  }
}

module.exports = CommonMagic;
