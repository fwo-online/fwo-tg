const { floatNumber } = require('../../utils/floatNumber');
const { default: arena } = require('../index');
const MiscService = require('../MiscService');
const { dodge, parry, disarm } = require('../skills');
const { isFailResult } = require('./utils');

/**
 * @typedef {import ('../GameService').default} game
 * @typedef {import ('../PlayersService').Player} player
 */

/**
 * Конструктор физической атаки
 * (возможно физ скилы)
 * @todo Сейчас при отсутствие защиты на цели, не учитывается статик протект(
 * ???) Т.е если цель не защищается атака по ней на 95% удачна
 * */
class PhysConstructor { /**
  * @type {import('./PreAffect').PreAffect[]}
  * */
  preAffects;
  /**
   * Конструктор атаки
   * @param {atkAct} atkAct имя actions
   * @typedef {Object} atkAct
   * @property {String} name
   * @property {string} displayName
   * @property {String} desc
   * @property {Number} lvl
   * @property {String} orderType
   *
   * @param {import('./PreAffect').PreAffect[]} preAffects
   */
  constructor(atkAct, preAffects = [dodge, parry, disarm]) {
    this.name = atkAct.name;
    this.displayName = atkAct.displayName;
    this.desc = atkAct.desc;
    this.lvl = atkAct.lvl;
    this.orderType = atkAct.orderType;
    this.status = { hit: 0, exp: 0 };
    /**
   * @type {import('./PreAffect').PreAffect[]}
   * */
    this.preAffects = preAffects;
  }

  /**
   * Основная функция выполнения. Из неё дёргаются все зависимости
   * Общий метод для скилов физической атаки
   * @param {player} initiator Объект кастера
   * @param {player} target Объект цели
   * @param {game} game Объект игры (не обязателен)
   */
  cast(initiator, target, game) {
    this.params = {
      initiator, target, game,
    };
    this.status = { hit: 0, exp: 0 };
    try {
      this.fitsCheck();
      this.checkPreAffects();
      this.isBlurredMind();
      this.protectCheck();
      // тут должен идти просчет дефа
      this.checkPostEffect();
      this.checkTargetIsDead();
      this.next();
    } catch (e) {
      this.next(e);
    }
  }

  /**
   * Проверка флагов влияющих на физический урон
   */
  checkPreAffects() {
    if (this.game.flags.global.isEclipsed) throw this.breaks('ECLIPSE');

    this.preAffects.forEach((preAffect) => {
      const result = preAffect.check(this.params);

      if (result && isFailResult(result)) {
        console.log(result.message);
        throw this.breaks(result.message);
      }
    });
  }

  /**
   * Проверка флагов влияющих на физический урон
   */
  fitsCheck() {
    const { initiator } = this.params;
    if (!initiator.weapon) throw this.breaks('NO_WEAPON');
  }

  /**
   * Проверка флагов влияющих на выбор цели
   */
  isBlurredMind() {
    const { initiator, game } = this.params;
    if (initiator.flags.isGlitched) {
      // Меняем цель внутри атаки на любого живого в игре
      this.params.target = game.players.randomAlive;
    }
    if (initiator.flags.isMad) {
      this.params.target = initiator;
    }
    if (initiator.flags.isParalysed) {
      throw this.breaks('PARALYSED');
    }
  }

  /**
   * Проверка прохождения защиты цели
   * Если проверка провалена, выставляем флаг isHited, означающий что
   * атака прошла
   */
  protectCheck() {
    const { initiator, target } = this.params;
    const atc = initiator.stats.val('patk') * initiator.proc;
    const prt = target.flags.isProtected.length > 0 ? target.stats.val('pdef') : 0.1;
    const at = floatNumber(Math.round(atc / prt));
    console.log('at', at);
    const r = MiscService.rndm('1d100');
    // const c = Math.round(Math.sqrt(at) + (10 * at) + 5);
    // new formula for phys attack chance
    const c = 20 * at + 50;
    const result = c > r;
    console.log('left', c, 'right', r, 'result', result);
    const initiatorHitParam = initiator.stats.val('hit');
    const hitval = MiscService.randInt(
      initiatorHitParam.min,
      initiatorHitParam.max,
    );
    this.status.hit = floatNumber(hitval * initiator.proc);
    if (result) {
      this.params.target.flags.isHited = {
        initiator: initiator.nick, val: this.status.hit,
      };
      this.run();
    } else {
      throw this.protectorsGetExp();
    }
  }

  /**
   * Запуск работы actions
   */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
  run() {
  }

  /**
   * Проверка postEffector от Fits
   */
  checkPostEffect() {
    return this;
  }

  /**
   * Функция агрегации данных после выполннения действия
   */
  next(failMsg) {
    const { initiator, target, game } = this.params;
    const weapon = initiator.weapon ? arena.items[initiator.weapon.code] : {};
    if (failMsg) {
      game.recordOrderResult({ ...failMsg, weapon });
    } else {
      const msg = {
        exp: this.status.exp,
        action: this.name,
        actionType: 'phys',
        target: target.nick,
        dmg: floatNumber(this.status.hit),
        hp: target.stats.val('hp'),
        initiator: initiator.nick,
        weapon,
        dmgType: 'physical',
      };
      game.recordOrderResult(msg);
    }
  }

  /**
   * Проверка убита ли цель
   * @todo после того как был нанесен урон любым dmg action, следует производить
   * общую проверку
   */
  checkTargetIsDead() {
    const { initiator, target } = this.params;
    const hpNow = target.stats.val('hp');
    if (hpNow <= 0 && !target.getKiller()) {
      target.setKiller(initiator);
    }
  }

  /**
   * @param {String} msg строка остановки атаки (причина)
   */
  breaks(msg) {
    return {
      actionType: 'phys',
      message: msg,
      action: this.name,
      initiator: this.params.initiator.nick,
      target: this.params.target.nick,
    };
  }

  /**
   * Расчитываем полученный exp
   */
  getExp() {
    const { initiator, target, game } = this.params;

    if (game.isPlayersAlly(initiator, target) && !initiator.flags.isGlitched) {
      this.status.exp = 0;
    } else {
      const exp = this.status.hit * 8;
      this.status.exp = Math.round(exp);
      initiator.stats.mode('up', 'exp', this.status.exp);
    }
  }

  /**
   * Функция выдающая exp для каждого протектора в зависимости от его защиты
   * @todo тут скорее всего бага, которая будет давать по 5 раз всем защищающим.
   * Экспу за протект нужно выдавать в отдельном action'е который будет идти
   * за протектом
   */
  protectorsGetExp() {
    if (!this.params) return;
    const { initiator, target, game } = this.params;
    const pdef = target.stats.val('pdef'); // общий показатель защиты цели
    /** @type {import('./types').ExpArr} */
    const expArr = target.flags.isProtected.map((flag) => {
      const defender = game.players.getById(flag.initiator);
      if (defender.id === initiator.id || !game.isPlayersAlly(defender, target)) {
        return { name: defender.nick, exp: 0 };
      }
      const protect = Math.floor(flag.val * 100) / pdef;
      const exp = Math.round(this.status.hit * 0.8 * protect);
      defender.stats.up('exp', exp);
      return { name: defender.nick, exp };
    });

    return { ...this.breaks('DEF'), expArr };
  }
}

module.exports = PhysConstructor;
