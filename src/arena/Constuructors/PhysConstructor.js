/**
 * Конструктор физической атаки
 * (возможно физ скилы)
 * @todo Сейчас при осутствие защиты на целе, не учитывается статик протект(
 * ???) Т.е если цель не защищается атака по ней на 95% удачна
 **/
class PhysConstructor {
  /**
   * Конструктор атаки
   * @param {String} atkAct имя actions
   */
  constructor(atkAct) {
    _.assign(this, atkAct);
    this.status = {};
    this.status.failReason = undefined; // причина провала атаки
  }

  /**
   * Основная функция выполнения. Из неё дёргаются все зависимости
   * Общий метод каста магии
   * в нём выполняются общие функции для всех магий
   * @param {Object} initiator Обьект кастера
   * @param {Object} target Обьект цели
   * @param {Object} game Обьект игры (не обязателен)
   */
  cast(initiator, target, game) {
    this.params = {
      initiator: initiator, target: target, game: game,
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
  checkPreAffects() {}

  /**
   * Проверка флагаов влияющих на физический урон
   */
  fitsCheck() {}

  /**
   * Проверка флагаов влияющих на выбор цели
   */
  isblurredMind() {}

  /**
   * Проверка прохождения защиты цели
   * Если проверка провалена, выставляем флаг isHited, означающий что
   * атака прошла
   */
  protectCheck() {
    let i = this.params.initiator;
    let t = this.params.target;
    let atc = i.stats.val('patk') * i.proc;
    let prt = t.flags.isProtected.length > 0 ? t.stats.val('pdef') : 0.1;
    let at = floatNumber(Math.round(atc / prt));
    sails.log('at', at);
    let r = MiscService.rndm('1d100');
    let c = Math.round(Math.sqrt(at) + (10 * at) + 5);
    let result = c > r;
    sails.log('left', c, 'right', r, 'result', result);
    let initiatorHitParam = i.stats.val('hit');
    let hitval = MiscService.randInt(initiatorHitParam.min,
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
  run() {}

  /**
   * Проверка postEffector от Fits
   */
  checkPostEffect() {}

  /**
   * Функция агрегации данных после выполнениния действия
   */
  next() {
    let target = this.params.target;
    let initiator = this.params.initiator;
    let bl = this.params.game.battleLog;
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
    let t = this.params.target;
    let hpNow = t.stats.val('hp').val;
    if (hpNow <= 0 && _.isEmpty(t.flags.isDead)) {
      t.flags.isDead = ({
        action: this.name, initiator: this.params.initiator.id,
      });
    }
  }

  /**
   * Расчитываем полученный exp
   */
  getExp() {
    let i = this.params.initiator.stats;
    let e = this.status.hit * 8;
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
    let t = this.params.target; // Обьект цеои
    let f = t.flags.isProtected; // Коллекция защищающих [{id,кол-во дефа},..]
    const G = this.params.game; // Обьект игры
    const prt = t.stats.val('def'); // общий показатель защиты цели
    f.forEach((p) => {
      const pr = Math.floor(parseFloat(p.val) * 100 / parseFloat(prt));
      const e = Math.round(this.status.hit * 8 * pr / 100);
      G.getPlayerById(p.initiator).stats.mode('up', 'exp', e);
    });
  }
}

module.exports = PhysConstructor;
