const floatNumber = require('../floatNumber');
/**
 *[1,2 из 6] BOND заклинанием <Усыхание> состарил ReaL,
 *и лишил его 28.33hp. (h:-28.33/1.31, e:+13/650)
 */
// import Magic from './MagicConstructor';
const DmgMagic = require('./DmgMagicConstructor');

/**
 * @typedef {import ('../PlayerService').default} player
 * @typedef {import ('../GameService')} game
 * @typedef {import ('./MagicConstructor').Magic} baseMag
 * @typedef {import ('./DmgMagicConstructor').dmgMag} dmgMag
 */

/**
 * Общий конструктор не длительных магий
 */
class LongDmgMagic extends DmgMagic {
  /**
   * Конструктор длительных магий
   * @param {baseMag & dmgMag} magObj
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
   * глушим первичный вывод
   */
  // eslint-disable-next-line class-methods-use-this
  next() {
  }

  /**
   * getExp
   */
  // eslint-disable-next-line class-methods-use-this
  getExp() {}

  /**
   * Функция формирующая специальный формат вывода для длительной магии
   * @param {player} i
   * @param {player} t
   * @todo в старой арене формат длительной атакующей магии был :
   *
   */
  longNext(i, t) {
    const { game } = this.params;
    // noinspection Annotator
    const dmgObj = {
      exp: this.status.exp,
      dmg: floatNumber(this.status.hit),
      action: this.displayName,
      actionType: 'magic',
      target: t.nick,
      initiator: i.nick,
      hp: t.stats.val('hp'),
      dmgType: this.dmgType,
    };
    game.addHistoryDamage(dmgObj);
    game.battleLog.success(dmgObj);
    this.params = {};
    this.status = {};
  }

  /**
   * Кастыль для обработки длительной магии
   * @param {game} game обьект игры
   * @todo hardcode =(
   * @todo возможно нужно вынести это в отдельный конструктор с которого будет
   * наследоваться вся логика "длительных" , сейча пока делаю так для mvp
   * @todo нужно выполнять groupBy по имени кастера, а затем "складывать"
   * урон и порядковые номера кастов и т.п
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
        super.checkTargetIsDead();
        this.longNext(i, t);
      } catch (e) {
        game.battleLog.log(e);
      }
    });
  }

  /**
   * Функция формирует обьект параметров длительной магии внутри Game, для
   * текущего типа action
   * @param {player} i  initiator
   * @param {player} t  target
   * @param {game} g  Game
   * buff = { frostTouch = [{initiator,target,duration},{}] }
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
    this.params = {};
  }
}

module.exports = LongDmgMagic;
