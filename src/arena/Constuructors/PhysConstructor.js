const floatNumber = require('../floatNumber');
const MiscService = require('../MiscService');

/**
 * @typedef {import ('../GameService')} game
 * @typedef {import ('../PlayerService')} player
 */

/**
 * Конструктор физической атаки
 * (возможно физ скилы)
 * @todo Сейчас при осутствие защиты на целе, не учитывается статик протект(
 * ???) Т.е если цель не защищается атака по ней на 95% удачна
 * */
class PhysConstructor {
  /**
   * Конструктор атаки
   * @param {atkAct} atkAct имя actions
   * @typedef {Object} atkAct
   * @property {String} name
   * @property {string} displayName
   * @property {String} desc
   * @property {Number} lvl
   * @property {String} orderType
   */
  constructor(atkAct) {
    this.name = atkAct.name;
    this.displayName = atkAct.displayName;
    this.desc = atkAct.desc;
    this.lvl = atkAct.lvl;
    this.orderType = atkAct.orderType;
    this.status = {};
  }

  /**
   * Основная функция выполнения. Из неё дёргаются все зависимости
   * Общий метод для скилов физической атаки
   * @param {player} initiator Обьект кастера
   * @param {player} target Обьект цели
   * @param {game} game Обьект игры (не обязателен)
   */
  cast(initiator, target, game) {
    this.params = {
      initiator, target, game,
    };
    this.status = {};
    try {
      this.checkPreAffects();
      this.fitsCheck();
      this.isblurredMind();
      this.protectCheck();
      // тут должен идти просчет дефа
      this.checkPostEffect();
      this.checkTargetIsDead();
      this.next();
    } catch (e) {
      const { battleLog } = this.params.game;
      battleLog.log(e);
    }
  }

  /**
   * Проверка флагаов влияющих на физический урон
   */
  checkPreAffects() {
    const { initiator, target } = this.params;
    const hasDodgingItems = initiator.items
      .some((i) => i.wtype && MiscService.weaponTypes[i.wtype].dodge);
    // Проверяем увёртку
    if (target.flags.isDodging && hasDodgingItems) {
      //  проверяем имеет ли цель достаточно dex для того что бы уклониться
      const iDex = initiator.stats.val('dex');
      const at = floatNumber(Math.round(target.flags.isDodging / iDex));
      // eslint-disable-next-line no-console
      console.log('Dodging: ', at);
      const r = MiscService.rndm('1d100');
      const c = Math.round(Math.sqrt(at) + (10 * at) + 5);
      // eslint-disable-next-line no-console
      console.log('left:', c, ' right:', r, ' result:', c > r);
      if (c > r) throw this.breaks('DODGED');
    }
  }

  /**
   * Проверка флагаов влияющих на физический урон
   */
  fitsCheck() {
    return this;
  }

  /**
   * Проверка флагаов влияющих на выбор цели
   */
  isblurredMind() {
    return this;
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
    // eslint-disable-next-line no-console
    console.log('at', at);
    const r = MiscService.rndm('1d100');
    const c = Math.round(Math.sqrt(at) + (10 * at) + 5);
    const result = c > r;
    // eslint-disable-next-line no-console
    console.log('left', c, 'right', r, 'result', result);
    const initiatorHitParam = initiator.stats.val('hit');
    const hitval = MiscService.randInt(initiatorHitParam.min,
      initiatorHitParam.max);
    this.status.hit = floatNumber(hitval * initiator.proc);
    if (result) {
      this.params.target.flags.isHited = ({
        initiator: initiator.nick, hit: this.status.hit,
      });
      this.run();
    } else {
      this.protectorsGetExp();
      throw this.breaks('DEF');
    }
  }

  /**
   * Запуск работы actions
   */
  run() {
    return this;
  }

  /**
   * Проверка postEffector от Fits
   */
  checkPostEffect() {
    return this;
  }

  /**
   * Функция агрегации данных после выполнениния действия
   */
  next() {
    const { initiator, target } = this.params;
    const { battleLog } = this.params.game;
    const weapon = initiator.weapon || {};

    const msg = {
      exp: this.status.exp,
      action: this.name,
      actionType: 'phys',
      target: target.nick,
      dmg: floatNumber(this.status.hit),
      hp: target.stats.val('hp'),
      initiator: initiator.nick,
      dmgType: 'phys',
      weapon,
    };
    battleLog.success(msg);
  }

  /**
   * Проверка убита ли цель
   * @todo после того как был нанесен урон любым dmg action, следует произовдить
   * общую проверку
   */
  checkTargetIsDead() {
    const { target } = this.params;
    const hpNow = target.stats.val('hp');
    if (hpNow <= 0 && !Object.keys(target.flags.isDead).length) {
      target.flags.isDead = {
        action: this.name, initiator: this.params.initiator.id,
      };
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
    const i = this.params.initiator.stats;
    const e = this.status.hit * 8;
    this.status.exp = Math.round(e);
    i.mode('up', 'exp', this.status.exp);
  }

  /**
   * Функция выдающая exp для каждого протектора в зависимости от его защиты
   * @todo тут скорее всего бага, которая будет давать по 5 раз всем защищающим.
   * Экспу за протект нужно выдавать в отдельном action'е который будет идти
   * за протектом
   */
  protectorsGetExp() {
    const { target, game } = this.params;
    const f = target.flags.isProtected; // Коллекция защищающих [{id,кол-во дефа},..]
    const prt = target.stats.val('pdef'); // общий показатель защиты цели
    f.forEach((p) => {
      const pr = (Math.floor(p.val * 100) / prt);
      const e = Math.round(this.status.hit * 0.8 * pr);
      game.getPlayerById(p.initiator).stats.mode('up', 'exp', e);
    });
  }
}

module.exports = PhysConstructor;
