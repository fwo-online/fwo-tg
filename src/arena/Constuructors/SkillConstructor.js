const MiscService = require('../MiscService');

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService').default} player
 */

/**
 * Основной конструктор класса скилов (войны/лучники)
 */
class Skill {
  /**
   * Создание скила
   * @param {skill} params параметры создания нового скилла
   * @typedef {Object} skill
   * @property {String} name
   * @property {String} displayName;
   * @property {String} desc
   * @property {Number[]} cost
   * @property {Number} proc
   * @property {Number} baseExp
   * @property {String} costType
   * @property {Number} lvl
   * @property {String} orderType
   * @property {String} aoeType
   * @property {Number[]} chance
   * @property {Number[]} effect
   * @property {Function} msg
   * @property {String[]} profList - массив проф
   * @property {Number[]} bonusCost
   */
  constructor(params) {
    this.name = params.name;
    this.displayName = params.displayName;
    this.desc = params.desc;
    this.cost = params.cost;
    this.proc = params.proc;
    this.baseExp = params.baseExp;
    this.costType = params.costType;
    this.lvl = params.lvl;
    this.orderType = params.orderType;
    this.aoeType = params.aoeType;
    this.chance = params.chance;
    this.effect = params.effect;
    this.msg = params.msg;
    this.profList = params.profList;
    this.bonusCost = params.bonusCost;
  }

  /**
   * Основная точка вхождения в выполнение скила
   * @param {player} initiator инициатор
   * @param {player} target цель
   * @param {game} game Game обьект игры
   */
  cast(initiator, target, game) {
    this.params = {
      initiator, target, game,
    };
    try {
      this.getCost();
      this.checkChance();
      this.run();
      this.next();
      this.getExp(initiator);
    } catch (failMsg) {
      const { battleLog } = this.params.game;
      battleLog.log(failMsg);
      this.params = null;
    }
  }

  /**
   * Функция снимает требуемое кол-во en за использования скила
   * @param {player} initiator
   */
  // eslint-disable-next-line class-methods-use-this
  getCost() {
    const { initiator } = this.params;
    // достаем цену за использование согласно lvl скила у пользователя
    const skillCost = this.cost[initiator.skills[this.name] - 1];
    const remainingEnergy = initiator.stats.val(this.costType) - skillCost;
    if (remainingEnergy >= 0) {
      initiator.stats.mode('set', this.costType, +remainingEnergy);
    } else {
      throw this.breaks('NO_ENERGY');
    }
  }

  /**
   * Проверяем шанс прохождения скилла
   */
  checkChance() {
    if (MiscService.rndm('1d100') > this.getChance()) {
      // скил сфейлился
      throw this.breaks('SKILL_FAIL');
    }
  }

  /**
   * Собираем параметр шанса
   * @return {Number} шанс прохождения
   */
  getChance() {
    const { initiator } = this.params;
    const initiatorSkillLvl = initiator.skills[this.name];
    return this.chance[initiatorSkillLvl - 1];
  }

  /**
   * Успешное прохождение скила и отправка записи в BattleLog
   */
  next() {
    this.params.game.battleLog.success({
      exp: this.baseExp,
      action: this.displayName,
      actionType: 'skill',
      target: this.params.target.nick,
      initiator: this.params.initiator.nick,
      msg: this.msg,
    });
    this.params = null;
  }

  /**
   * Пустая функция для потомка
   */
  // eslint-disable-next-line class-methods-use-this
  run() {}

  /**
   * Расчитываем полученный exp
   */
  getExp(initiator) {
    initiator.stats.mode('up', 'exp', this.baseExp);
  }

  /**
   * Обработка провала магии
   */
  breaks(e) {
    return {
      action: this.displayName,
      initiator: this.params.initiator.nick,
      message: e,
    };
  }
}

module.exports = Skill;
