const Magic = require('./MagicConstructor');
const floatNumber = require('../floatNumber');
const MiscService = require('../MiscService');

/**
 * @typedef {import ('../PlayerService')} player
 * @typedef {import ('../GameService')} game
 * @typedef {import ('./MagicConstructor').baseMag} baseMag
 * @typedef {Object} dmgMag
 * @property {string} dmgType
 */

/**
 * Общий конструктор не длительных магий
 */
class DmgMagic extends Magic {
  /**
   * Создание магии
   * @param {dmgMag & baseMag} magObj Обьект создаваемой магии
   */
  constructor(magObj) {
    super(magObj);
    this.dmgType = magObj.dmgType;
    this.status = {};
  }

  /**
   * Возвращает шанс прохождения магии
   * @todo сюда же надо добавить эффекты от resists
   * @return {number}
   */
  effectVal() {
    const {initiator, target} = this.params;
    const initiatorMagicLvl = initiator.magics[this.name];
    let eff = MiscService.dice(this.effect[initiatorMagicLvl - 1]) * initiator.proc;
    if (this.dmgType !== 'clear') {
      // правим урон от mgp цели и mga кастера
      eff = eff * (1 + 0.004 * initiator.stats.val('mga'))
          * (1 - 0.002 * target.stats.val('mgp'));
      const resist = target.resists[this.dmgType];
      if (resist) {
        eff = resist(eff);
      }
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

    if (game.isPlayersAlly(initiator, target) && !initiator.flags.isGlitched) {
      this.status.exp = 0;
    } else {
      const dmgExp = Math.round(this.status.hit * 8) + this.baseExp;
      this.status.exp = dmgExp;
      initiator.stats.mode('up', 'exp', dmgExp);
    }
  }

  /**
   * Магия прошла удачно
   * @param {player} initiator обьект персонажаы
   * @param {player} target обьект цели магии
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
