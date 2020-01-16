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
   * @property {Object} modifiers
   * @property {Object} resists
   * @property {Object} skills
   * @property {Object} magics
   * @property {Object} statical
   * @property {Object} def
   * @property {Number} proc
   * @property {Number} lvl
   * @property {Number} clan
   */
  constructor(params) {
    this.nick = params.nickname;
    this.id = params.id;
    this.tgId = params.tgId;
    this.prof = params.prof;
    this.lvl = params.lvl;
    this.clan = params.clan;
    this.stats = new StatsService(params.def);
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
