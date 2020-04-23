const MiscService = require('../MiscService');

/**
 * @typedef {import ('../PlayerService')} player
 * @typedef {import ('../GameService')} game
 */

/**
 * Конструктор магии
 */
class Magic {
  /**
   * Создание магии
   * @param {magObj} magObj Обьект создаваемой магии
   * @typedef {Object} magObj
   * @property {String} name Имя магии
   * @property {String} desc Короткое описание
   * @property {Number} cost Стоимость за использование
   * @property {String} costType Тип единицы стоимости {en/mp}
   * @property {Number} lvl Требуемый уровень круга магий для использования
   * @property {String} orderType Тип цели заклинания self/team/enemy/enemyTeam
   * @property {String} aoeType Тип нанесения урона по цели:
   * @property {Number} baseExp Стартовый параметр exp за действие
   * target/targetAoe/all/allNoinitiator/team/self
   * @property {String[]} effect размер рандомного эффект от магии
   * @property {String} magType Тип магии good/bad/neutral
   * @property {Number[]} chance
   * @property {String} costType
   * @property {Number} baseExp
   * @property {Number} cost
   */
  constructor(magObj) {
    Object.assign(this, magObj);
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
      this.isblurredMind(initiator, game); // проверка не запудрило
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
      initiator.stats[this.costType] = +costValue;
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
   * @return {Number} dice число эффекта
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
   * @return {Number} result шанс прохождения
   * @todo нужно кроме шанса магии прибавлять модификатор чара
   * @todo Всё ниже рассчитывается дла бафов и не учитывает mdef/mga
   */
  getChance() {
    const { initiator, target } = this.params;
    const initiatorMagicLvl = initiator.magics[this.name];
    // eslint-disable-next-line no-console
    console.log('getChance:magicLvl:', initiatorMagicLvl);
    const imc = initiator.modifiers.castChance; // мод шанс прохождения
    const acm = initiator.modifiers.magics[this.name] || 0; // мод action'а
    let chance = this.chance[initiatorMagicLvl - 1];
    if (typeof chance === 'string') {
      chance = MiscService.rndm(chance);
    }
    let result = chance + imc;

    if (acm && acm.chance) {
      // если модификатор шанса для этого скила есть,
      // то плюсуем его к шансу
      result += +acm.chance;
    }
    // тут нужно взять получившийся шанс и проверить ещё отношение mga цели
    if (this.magType === 'bad') {
      const x = (initiator.stats.val('mga') / target.stats.val('mgp'));
      result *= x;
    }
    console.log('chance is :', result * initiator.proc);
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
  isblurredMind(initiator, game) {
    if (initiator.flags.isGlitched) {
      // если кастер находится под глюком/безой/остальными
      // eslint-disable-next-line no-console
      console.log('todo isblurredMind');
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
   * @param {String} msg строка остановки магии (причина)
   * @return {Object} обьект остановки магии
   */
  breaks(msg) {
    return {
      actionType: 'magic',
      message: msg,
      action: this.name,
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
      action: this.name,
      actionType: 'magic',
      target: target.nick,
      initiator: initiator.nick,
      effect: this.status.effect,
    });
    this.params = null;
  }
}

module.exports = Magic;
