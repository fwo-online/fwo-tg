const StatsService = require('./StatsService');
const FlagsConstructors = require('./Constuructors/FlagsConstructor');
/**
 * PlayerService
 * @description Обьект игрока внутри боя ! Это не Character!
 * @module Service/Player
 */

// @todo нужно создать отдельный метод, для автоматического сложения всех харок
// аналогично парсеру.

/**
 * Обьект игрока со всеми плюшками
 */
class Player {
  /**
   * Конструктор обьекта игрока внутри игры
   * @param {params} params
   * @typedef {Object} params параметры игрока из обьекта CharObj
   * @property {String} nickname
   * @property {String} id
   * @property {Number} tgId
   * @property {String} prof
   * @property {Object.<string, number>}modifiers
   * @property {Object.<string, number>} resists
   * @property {Object.<string, number>} skills
   * @property {Object.<string, number>} magics
   * @property {Object} statical
   * @property {Object} def
   * @property {Number} proc
   * @property {Number} lvl
   * @property {{code: string, putOn: boolean}[]} items
   * @property {Object.<string, number>} harks
   */
  constructor(params) {
    this.nick = params.nickname;
    this.id = params.id;
    this.tgId = params.tgId;
    this.prof = params.prof;
    this.lvl = params.lvl;
    this.items = params.items
      .filter((item) => item.putOn)
      .map((item) => ({
        /** @type {string} */
        wtype: global.arena.items[item.code].wtype,
        case: global.arena.items[item.code].case,
        name: global.arena.items[item.code].name,
      }));
    this.stats = new StatsService({ ...params.def, ...params.harks });
    this.flags = new FlagsConstructors();
    // @todo закладка для вычисляемых статов
    this.modifiers = { magics: {}, castChance: 0, ...params.modifiers }; // Обьект
    // модификаторов
    this.resists = params.resists || {}; // Обьект резистов
    this.skills = params.skills || {}; // Обькт доступных скилов
    this.magics = params.magics || {}; // обьект изученых магий
    this.statical = params.statical || {}; // статически реген
    this.alive = true;
    this.proc = 100;
    return this;
  }

  /**
   * Загрузка чара в память
   * @param {String} charId идентификатор чара
   */
  static loading(charId) {
    // @todo fast hack
    return new Player(global.arena.players[charId]);
  }

  /**
   * Функция вернет обьект состояния Player
   */
  getStatus() {
    return {
      hp: this.stats.val('hp'),
    };
  }

  /**
   * Функция вернет обьект состояния Player для отображения команде
   */
  getFullStatus() {
    return {
      hp: this.stats.val('hp'),
      mp: this.stats.val('mp'),
      en: this.stats.val('en'),
    };
  }
}

module.exports = Player;
