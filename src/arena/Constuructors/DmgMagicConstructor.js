const Magic = require('./MagicConstructor');
const floatNumber = require('../floatNumber');
const MiscService = require('../MiscService');

/**
 * Общий конструктор не длительных магий
 */
class DmgMagic extends Magic {
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
   * @param {String} dmgType Тип наносимого урона (для расчета резистов)
   */
  constructor(magObj) {
    super(magObj);
    this.status = {};
  }

  /**
   * Возвращает шанс прохождения магии
   * @todo сюда же надо добавить эффекты от resists
   * @return {number}
   */
  effectVal() {
    const i = this.params.initiator;
    const t = this.params.target;
    const initiatorMagicLvl = i.magics[this.name];
    let eff = MiscService.dice(this.effect[initiatorMagicLvl - 1]) * i.proc;
    if (this.dmgType !== 'clear') {
      // правим урон от mgp цели и mga кастера
      eff = eff * (1 + 0.004 * i.stats.val('mga'))
          * (1 - 0.002 * t.stats.val('mgp'));
    }
    this.status.hit = eff;
    return eff;
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param {Object} initiator Обьект кастера
   */
  getExp(initiator) {
    const dmgExp = Math.round(this.status.hit * 8) + this.baseExp;
    this.status.exp = dmgExp;
    initiator.stats.mode('up', 'exp', dmgExp);
  }

  /**
   * Магия прошла удачно
   * @param {Object} initiator обьект персонажаы
   * @param {Object} target обьект цели магии
   * @todo тут нужен вывод требуемых параметров
   */
  next(initiator, target) {
    const bl = this.params.game.battleLog;
    bl.success({
      exp: this.status.exp,
      dmg: floatNumber(this.status.hit),
      action: this.name,
      actionType: 'magic',
      target: target.nick,
      initiator: initiator.nick,
      dmgType: this.dmgType,
    });
  }
}

module.exports = DmgMagic;
