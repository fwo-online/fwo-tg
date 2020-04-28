const Magic = require('./MagicConstructor');
const floatNumber = require('../floatNumber');
const MiscService = require('../MiscService');

/**
 * Общий конструктор не длительных магий
 */
class DmgMagic extends Magic {
  /**
   * Создание магии
   * @param {magObj} magObj Обьект создаваемой магии
   * @typedef {Object} magObj
   * @property {String} name Имя магии
   * @property {String} displayName Отображаемое имя
   * @property {String} desc Короткое описание
   * @property {Number} cost Стоимость за использование
   * @property {String} costType Тип единицы стоимости {en/mp}
   * @property {Number} lvl Требуемый уровень круга магий для использования
   * @property {String} orderType Тип цели заклинания self/team/enemy/enemyTeam
   * @property {String} aoeType Тип нанесения урона по цели:
   * @property {Number} baseExp Стартовый параметр exp за действие
   * target/targetAoe/all/allNoinitiator/team/self
   * @property {String} magType Тип магии good/bad/neutral
   * @property {String[]} effect размер рандомного эффект от магии
   * @property {Number[]} chance
   * @property {String[]} profList
   * @property {String} dmgType Тип наносимого урона (для расчета резистов)
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
   */
  getExp() {
    const { initiator, target, game } = this.params;

    if (game.isPlayersAlly(initiator, target)) {
      this.status.exp = 0;
    } else {
      const dmgExp = Math.round(this.status.hit * 8) + this.baseExp;
      this.status.exp = dmgExp;
      initiator.stats.mode('up', 'exp', dmgExp);
    }
  }

  /**
   * Магия прошла удачно
   * @param {Object} initiator обьект персонажаы
   * @param {Object} target обьект цели магии
   * @todo тут нужен вывод требуемых параметров
   */
  next(initiator, target) {
    const { game } = this.params;
    const dmgObj = {
      exp: this.status.exp,
      dmg: floatNumber(this.status.hit),
      action: this.displayName,
      actionType: 'magic',
      target: target.nick,
      hp: target.stats.val('hp'),
      initiator: initiator.nick,
      dmgType: this.dmgType,
    };
    game.addHistoryDamage(dmgObj);
    game.battleLog.success(dmgObj);
  }
}

module.exports = DmgMagic;
