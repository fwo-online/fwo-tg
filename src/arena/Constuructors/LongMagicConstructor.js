// import Magic from './MagicConstructor';
const Common = require('./CommonMagicConstructor');
const floatNumber = require('../floatNumber');

/**
 * @typedef {import ('../PlayerService')} player
 * @typedef {import ('../GameService')} game
 * @typedef {import ('./MagicConstructor').baseMag} baseMag
 */

/**
 * Общий конструктор не длительных магий
 */
class LongMagic extends Common {
  /**
   * Конструктор длительных магий
   * @param {baseMag} magObj
   */
  // eslint-disable-next-line no-useless-constructor
  constructor(magObj) {
    super(magObj);
  }

  /**
   * Добавляем в основной каст postRun для записи длительной магии в массив
   * @param {player} i  initiator
   * @param {player} t  target
   * @param {game} g  Game
   */
  cast(i, t, g) {
    try {
      g.longActions[this.name] = g.longActions[this.name] || [];
      this.buff = g.longActions[this.name];
      super.cast(i, t, g);
      this.postRun(i, t, g);
    } catch (e) {
      const bl = g.battleLog;
      bl.log(e);
    }
  }

  /**
   * Кастыль для обработки длительной магии
   * @param {game} game обьект игры
   * @todo hardcode =(
   */
  checkLong(game) {
    // делаю просто перебор по массиву, контроль лежащей здесь магии должен
    // осуществлять Game, т.е при смерти кастера или таргета, нужно вычищать,
    // обьект longActions и удалять касты связанные с трупами
    if (!game.longActions[this.name]) return;
    // eslint-disable-next-line no-console
    console.log('longMagic:debug:Array:', game.longActions[this.name]);
    // [ { initiator: 2, target: 1, duration: 1, round: 0, proc: 1 } ]
    // выполняем обычный запуск магии
    const longArray = game.longActions[this.name];
    longArray.forEach((a) => {
      if (a.duration < 1) return;
      try {
        a.duration -= 1;
        const i = game.getPlayerById(a.initiator);
        const t = game.getPlayerById(a.target);
        this.params = { initiator: i, target: t, game };
        this.params.initiator.proc = a.proc;
        this.checkPreAffects(i, t, game);
        if (game.round.count !== a.round) {
          this.isblurredMind(i, game); // проверка не запудрило
          this.checkChance();
        }
        this.longRun(i, t, game); // вызов кастомного обработчика
        super.getExp(i);
        super.checkTargetIsDead(); // проверка трупов в длительных магиях
        this.longNext(i, t);
      } catch (e) {
        game.battleLog.log(e);
      }
    });
  }

  /**
   * Функция формирует обьект параметров длительной магии внутри Game, для
   * текущего типа action
   * @param {player} i Обьект кастера
   * @param {player} t Обьект цели
   * @param {game} g Обьект игры
   * buff = { frostTouch = [{initiator,target,duration},{}] }
   * @todo нужно разрулить этот треш ибо оно работает ужасно
   */
  postRun(i, t, g) {
    // eslint-disable-next-line no-console
    console.log('postRun');
    if (!this.buff) this.buff = [];
    this.buff.push({
      initiator: this.params.initiator.id || i.id,
      target: this.params.target.id || t.id,
      duration: this.params.initiator.stats.val('lspell')
          || i.stats.val('lspell'),
      round: this.params.game.round.count || g.round.count,
      proc: this.params.initiator.proc || i.proc,
    });
    this.params = null;
  }

  /**
   * блочим вывод основного конструктора магий
   */
  // eslint-disable-next-line class-methods-use-this
  next() {}

  /**
   * блочим получение exp при срабатывание
   * конструктора магий
   */
  // eslint-disable-next-line class-methods-use-this
  getExp() {}

  /**
   * Вызов логгера для длительных магий
   * @param {player} i
   * @param {player} t
   */
  longNext(i, t) {
    const bl = this.params.game.battleLog;
    bl.success({
      exp: this.status.exp,
      dmg: floatNumber(this.status.hit),
      action: this.displayName,
      actionType: 'magic',
      target: t.nick,
      initiator: i.nick,
    });
  }
}

module.exports = LongMagic;

/**
 * [2,3,4 из 6] Эридан окутался <Сильной аурой> и
 * повысил свою защиту на 30.49pt. (e:+30/83)
 * [1 из 6] Эридан окутался <Аурой> и повысил свою
 * защиту на 1.63pt. (e:+2/84)
 * [4/7] ReaL заклинанием <Магическая стена> поднял
 *  защиту Mst на 329.57pt. (e:+33/638)
 */
