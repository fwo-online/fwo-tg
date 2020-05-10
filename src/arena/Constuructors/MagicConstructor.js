const MiscService = require('../MiscService');

/**
 * @typedef {import ('../PlayerService')} player
 * @typedef {import ('../GameService')} game
 * @typedef {Object} baseMag
 * @property {string} name Имя магии
 * @property {string} displayName Отображаемое имя
 * @property {string} desc Короткое описание
 * @property {number} cost Стоимость за использование
 * @property {string} costType Тип единицы стоимости {en/mp}
 * @property {number} lvl Требуемый уровень круга магий для использования
 * @property {string} orderType Тип цели заклинания self/team/enemy/enemyTeam
 * @property {string} aoeType Тип нанесения урона по цели:
 * @property {number} baseExp Стартовый параметр exp за действие
 * @property {string[]} effect размер рандомного эффект от магии
 * @property {string} magType Тип магии good/bad/neutral
 * @property {number[]} chance
 * @property {string[]} profList
 */

/**
 * Конструктор магии
 */
class Magic {
  /**
   * Создание магии
   * @param {baseMag} magObj Обьект создаваемой магии
   */
  constructor(magObj) {
    this.name = magObj.name;
    this.desk = magObj.desc;
    this.cost = magObj.cost;
    this.costType = magObj.costType;
    this.lvl = magObj.lvl;
    this.orderType = magObj.orderType;
    this.aoeType = magObj.aoeType;
    this.baseExp = magObj.baseExp;
    this.effect = magObj.effect;
    this.magType = magObj.magType;
    this.chance = magObj.chance;
    this.costType = magObj.costType;
    this.baseExp = magObj.baseExp;
    this.displayName = magObj.displayName;
    this.profList = magObj.profList;
    this.status = {};
  }

  /**
   * Длительная ли магия
   * @return {boolean}
   */
  get isLong() {
    return this.constructor.name === 'LongMagic' || this.constructor.name
        === 'LongDmgMagic';
  }

  // Дальше идут общие методы для всех магий
  /**
   * Общий метод каста магии
   * в нём выполняются общие функции для всех магий
   * @param {player} initiator Обьект кастера
   * @param {player} target Обьект цели
   * @param {game} [game] Обьект игры
   */
  cast(initiator, target, game) {
    this.params = {
      initiator, target, game,
    };
    try {
      this.getCost(initiator);
      this.checkPreAffects(initiator, target, game);
      this.isblurredMind(); // проверка не запудрило
      this.checkChance();
      this.run(initiator, target, game); // вызов кастомного обработчика
      this.getExp(initiator);
      this.next(initiator, target);
    } catch (failMsg) {
      const bl = this.params.game.battleLog;
      // @fixme прокидываем ошибку выше для длительных кастов
      if (this.isLong) throw (failMsg);
      bl.log(failMsg);
      this.params = null;
    }
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param {player} initiator Обьект кастера
   */
  getCost(initiator) {
    const costValue = parseFloat(initiator.stats.val(this.costType)
        - parseFloat(this.cost));
    console.log('MP:', costValue);
    if (costValue >= 0) {
      // eslint-disable-next-line no-param-reassign
      initiator.stats.mode('set', this.costType, costValue);
    } else {
      throw this.breaks('NO_MANA');
    }
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param {player} initiator Обьект кастера
   */
  getExp(initiator) {
    this.status.exp = Math.round(this.baseExp * initiator.proc);
    initiator.stats.mode('up', 'exp', this.baseExp);
  }

  /**
   * Функция расчитывай размер эффекат от магии по стандартным дайсам
   * @param {player} [initiator=this.param.initiator] Обьект персонажа
   * @return {number} dice число эффекта
   */
  effectVal(initiator = this.params.initiator) {
    const initiatorMagicLvl = initiator.magics[this.name];
    return MiscService.dice(this.effect[initiatorMagicLvl - 1]) * initiator.proc;
  }

  /**
   * Проверка прошла ли магия
   * @return {Boolean}
   */
  checkChance() {
    // Если шанс > random = true
    if (MiscService.rndm('1d100') <= this.getChance()) {
      // Магия прошла, проверяем что скажут боги
      if (this.godCheck()) {
        // Боги фейлят шанс
        throw this.breaks('GOD_FAIL');
      } else {
        // Магия прошла
        return true;
      }
    } else {
      // Магия провалилась, проверяем что скажут боги
      if (this.godCheck()) {
        // Боги помогают
        return true;
      }
      // Магия остается феловой
      throw this.breaks('CHANCE_FAIL');
    }
  }

  /**
   * Возвращает шанс прохождения магии
   * @return {number} result шанс прохождения
   */
  getChance() {
    const { initiator, target } = this.params;
    const initiatorMagicLvl = initiator.magics[this.name];
    const imc = initiator.modifiers.castChance || 0; // мод шанс прохождения
    const acm = initiator.modifiers.magics[this.name] || 0; // мод action'а
    let chance = this.chance[initiatorMagicLvl - 1];
    if (typeof chance === 'string') {
      chance = MiscService.dice(chance);
    }
    let result = chance + imc;

    if (acm && acm.chance) {
      // если модификатор шанса для этого скила есть,
      // то плюсуем его к шансу
      result += +acm.chance;
    }
    // тут нужно взять получившийся шанс и проверить ещё отношение mga цели
    // @todo magics cast chance
    if (this.magType === 'bad') {
      const x = (initiator.stats.val('mga') / target.stats.val('mgp')) * 3;
      result += x;
    }
    console.log('chance is :', result, 'total', result * initiator.proc);
    return result * initiator.proc;
  }

  /**
   * Функция воли богов
   * @return {Boolean} true/false решение богов
   */
  // eslint-disable-next-line class-methods-use-this
  godCheck() {
    return MiscService.rndm('1d100') <= 5;
  }

  /**
   * @param {player} [initiator] обьект персонажа
   * @param {player} [target] обьект персонажа
   * @param {game} [game] Обьект игры для доступа ко всему
   * @return {void}
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  run(initiator, target, game) {
    return this;
  }

  /**
   * @param {player} [initiator] обьект персонажа
   * @param {player} [target] обьект персонажа
   * @param {game} [game] Обьект игры для доступа ко всему
   * @return {void}
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  longRun(initiator, target, game) {
    return this;
  }

  /**
   * Проверка на запудревание мозгов
   * @param {player} initiator обьект персонажаы
   * @param {game} game Обьект игры для доступа ко всему
   * @todo нужно вынести этот метод в orders или к Players Obj
   */
  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  isblurredMind() {
    const { initiator, game } = this.params;
    if (initiator.flags.isGlitched) {
      this.params.target = game.playerArr.randomAlive;
    }
  }

  /**
   * Проверка на запудревание мозгов
   * @param {player} initiator обьект персонажаы
   * @param {player} target обьект цели магии
   * @param {game} game Обьект игры для доступа ко всему
   * @todo нужно вынести этот метод в orders
   */
  // eslint-disable-next-line no-unused-vars
  checkPreAffects(initiator, target, game) {
    const { isSilenced } = initiator.flags;
    if (isSilenced && isSilenced.some((e) => e.initiator !== this.name)) {
      // если кастер находится под безмолвием/бунтом богов
      throw this.breaks('SILENCED');
    }
  }

  /**
   * @param {string} msg строка остановки магии (причина)
   * @return обьект остановки магии
   */
  breaks(msg) {
    return {
      actionType: 'magic',
      message: msg,
      action: this.displayName,
      initiator: this.params.initiator.nick,
      target: this.params.target.nick,
    };
  }

  /**
   * Магия прошла удачно
   * @param {player} initiator обьект персонажаы
   * @param {player} target обьект цели магии
   * @todo тут нужен вывод требуемых параметров
   */
  next(initiator, target) {
    const bl = this.params.game.battleLog;
    bl.success({
      exp: this.status.exp,
      action: this.displayName,
      actionType: 'magic',
      target: target.nick,
      initiator: initiator.nick,
      effect: this.status.effect,
    });
    this.params = null;
  }
}

module.exports = Magic;
