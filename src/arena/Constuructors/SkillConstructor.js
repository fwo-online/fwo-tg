const MiscService = require('../MiscService');
/**
 * Основной конструктор класса скилов (войны/лучники)
 */
class Skill {
  /**
   * Создание скила
   * @param {Skill} params параметры создания нового скилла
   */
  constructor(params) {
    Object.assign(this, params);
  }

  /**
   * Основная точка вхождения в выполнение скила
   * @param {Object} i инициатор
   * @param {Object} t цель
   * @param {Object} g Game обьект игры
   */
  cast(i, t, g) {
    this.params = {
      initiator: i, target: t, game: g,
    };
    try {
      this.getCost();
      this.checkChance();
      this.run();
      this.next();
    } catch (e) {
      this.breaks(e);
    }
  }

  /**
   * Функция снимает требуемое кол-во en за использования скила
   */
  // eslint-disable-next-line class-methods-use-this
  getCost() {

  }

  /**
   * Проверяем шанс прохождения скилла
   */
  checkChance() {
    if (MiscService.rndm('1d100') > this.getChance()) {
      // скил сфейлился
      throw Error('SKILL_FAIL');
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
      action: this.name,
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
   * Обработка провала магии
   */
  breaks(e) {
    // eslint-disable-next-line no-console
    console.log(e);
    const msg = {
      action: this.name,
    };
    this.params.game.battleLog.log(msg);
    this.params = null;
  }
}

module.exports = Skill;
