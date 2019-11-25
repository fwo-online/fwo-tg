const floatNumber = require('../floatNumber');
const MiscService = require('../MiscService');

/**
 * Конструктор физической атаки
 * (возможно физ скилы)
 * @todo Сейчас при осутствие защиты на целе, не учитывается статик протект(
 * ???) Т.е если цель не защищается атака по ней на 95% удачна
 * */
class PhysConstructor {
  /**
   * Конструктор атаки
   * @param {String} atkAct имя actions
   */
  constructor(atkAct) {
    Object.assign(this, atkAct);
    this.status = {};
    this.status.failReason = undefined; // причина провала атаки
  }

  /**
   * Основная функция выполнения. Из неё дёргаются все зависимости
   * Общий метод для скилов физической атаки
   * @param {Object} initiator Обьект кастера
   * @param {Object} target Обьект цели
   * @param {Object} game Обьект игры (не обязателен)
   */
  cast(initiator, target, game) {
    this.params = {
      initiator, target, game,
    };
    const bl = this.params.game.battleLog;
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
      bl.log(e);
    }
  }

  /**
   * Проверка флагаов влияющих на физический урон
   */
  checkPreAffects() {
    const { initiator, target } = this.params;
    // Проверяем увёртку
    if (target.flags.isDodging) {
      // @todo нужна проверка на тип оружия в руках атакующего
      //  проверяем имеет ли цель достаточно dex для того что бы уклониться
      const iDex = initiator.stats.val('dex');
      const at = floatNumber(Math.round(target.flags.isDodging / iDex));
      // eslint-disable-next-line no-console
      console.log('Dodging: ', at);
      const r = MiscService.rndm('1d100');
      const c = Math.round(Math.sqrt(at) + (10 * at) + 5);
      const result = c > r;
      // eslint-disable-next-line no-console
      console.log('left:', c, ' right:', r, ' result:', result);
      this.status.failReason = ({
        action: 'dodge', message: 'dodged',
      });
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
    const i = this.params.initiator;
    const t = this.params.target;
    const atc = i.stats.val('patk') * i.proc;
    const prt = t.flags.isProtected.length > 0 ? t.stats.val('pdef') : 0.1;
    const at = floatNumber(Math.round(atc / prt));
    // eslint-disable-next-line no-console
    console.log('at', at);
    const r = MiscService.rndm('1d100');
    const c = Math.round(Math.sqrt(at) + (10 * at) + 5);
    const result = c > r;
    // eslint-disable-next-line no-console
    console.log('left', c, 'right', r, 'result', result);
    const initiatorHitParam = i.stats.val('hit');
    const hitval = MiscService.randInt(initiatorHitParam.min,
      initiatorHitParam.max);
    this.status.hit = floatNumber(hitval * i.proc);
    if (result) {
      this.params.target.flags.isHited = ({
        initiator: this.params.initiator.nick, hit: this.status.hit,
      });
      this.run();
    } else {
      this.status.failReason = ({
        action: 'protect', message: 'DEF',
      });
      this.protectorsGetExp();
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
    const { target } = this.params;
    const { initiator } = this.params;
    const bl = this.params.game.battleLog;
    let msg = '';
    if (this.status.failReason) {
      msg = ({
        target: target.nick,
        initiator: initiator.nick,
        failReason: this.status.failReason.action,
        message: this.status.failReason.message,
        actionType: 'phys',
      });
      bl.log(msg);
    } else {
      msg = ({
        exp: this.status.exp,
        action: this.name,
        actionType: 'phys',
        target: target.nick,
        dmg: floatNumber(this.status.hit),
        initiator: initiator.nick,
        dmgType: 'phys',
      });
      bl.success(msg);
    }
  }

  /**
   * Проверка убита ли цель
   * @todo после того как был нанесен урон любым dmg action, следует произовдить
   * общую проверку
   */
  checkTargetIsDead() {
    const t = this.params.target;
    const hpNow = t.stats.val('hp').val;
    if (hpNow <= 0 && !Object.keys(t.flags.isDead).length) {
      t.flags.isDead = ({
        action: this.name, initiator: this.params.initiator.id,
      });
    }
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
    const t = this.params.target; // Обьект цеои
    const f = t.flags.isProtected; // Коллекция защищающих [{id,кол-во дефа},..]
    const G = this.params.game; // Обьект игры
    const prt = t.stats.val('def'); // общий показатель защиты цели
    f.forEach((p) => {
      const pr = (Math.floor(parseFloat(p.val) * 100) / parseFloat(prt));
      const e = Math.round(this.status.hit * 0.8 * pr);
      G.getPlayerById(p.initiator).stats.mode('up', 'exp', e);
    });
  }
}

module.exports = PhysConstructor;
