/**
 * Конструктор магии
 */
class Magic {
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
   * @param {Number} baseExp Стартовый параметр exp за действие
   * target/targetAoe/all/allNoinitiator/team/self
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
   * @param {Object} initiator Обьект кастера
   * @param {Object} target Обьект цели
   * @param {Object} game Обьект игры (не обязателен)
   */
  cast(initiator, target, game) {
    this.params = {
      initiator, target, game,
    };
    try {
      this.checkPreAffects(initiator, target, game);
      this.isblurredMind(initiator, game); // проверка не запудрило
      this.getCost(initiator);
      this.checkChance(initiator);
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
   * @param {Object} initiator Обьект кастера
   */
  getCost(initiator) {
    const costValue = parseFloat(initiator.stats.val(this.costType)
      - parseFloat(this.cost));
    if (costValue >= 0) {
      initiator.stats[this.costType] = +costValue;
    } else {
      throw this.breaks('NO_MANA');
    }
  }

  /**
   * Функция списывающая с кастера требуемое
   * кол-во единиц за использование магии
   * Если кастеру хватило mp/en продолжаем,если нет, то возвращаем false
   * @param {Object} initiator Обьект кастера
   */
  getExp(initiator) {
    this.status.exp = Math.round(this.baseExp * initiator.proc);
    initiator.stats.mode('up', 'exp', this.baseExp);
  }

  /**
   * Функция расчитывай размер эффекат от магии по стандартным дайсам
   * @param {Object} initiator Обьект персонажа
   * @return {Number} dice число эффекта
   */
  effectVal(initiator) {
    const i = initiator || this.params.initiator;
    const initiatorMagicLvl = i.magics[this.name];
    return MiscService.dice(this.effect[initiatorMagicLvl - 1]) * i.proc;
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
    const { initiator } = this.params;
    const { target } = this.params;
    const initiatorMagicLvl = initiator.magics[this.name];
    sails.log('getChance:magicLvl:', initiatorMagicLvl);
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
    return result * initiator.proc;
  }

  /**
   * Функция воли богов
   * @return {Boolean} true/false решение богов
   */
  godCheck() {
    return MiscService.rndm('1d100') <= 5;
  }

  run() {}

  /**
   * Проверка на запудревание мозгов
   * @param {Object} initiator обьект персонажаы
   * @param {Object} game Обьект игры для доступа ко всему
   * @todo нужно вынести этот метод в orders или к Players Obj
   */
  isblurredMind(initiator, game) {
    if (initiator.flags.isGlitched) {
      // если кастер находится под глюком/безой/остальными
      sails.log('todo isblurredMind');
    }
  }

  /**
   * Проверка на запудревание мозгов
   * @param {Object} initiator обьект персонажаы
   * @param {Object} target обьект цели магии
   * @param {Object} game Обьект игры для доступа ко всему
   * @todo нужно вынести этот метод в orders
   */
  checkPreAffects(initiator, target, game) {
    const { isSilenced } = initiator.flags;
    if (isSilenced && isSilenced.some((e) => e.action !== this.name)) {
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
   * @param {Object} initiator обьект персонажаы
   * @param {Object} target обьект цели магии
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
