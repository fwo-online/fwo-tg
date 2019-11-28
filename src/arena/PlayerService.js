const StatsService = require('./StatsService');
const FlagsConstructors = require('./Constuructors/FlagsConstructor');
const channelHelper = require('../helpers/channelHelper');
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
   * @param {Object} params параметры игрока из обьекта CharObj
   */
  constructor(params) {
    this.nick = params.nickname;
    this.id = params.id;
    this.tgId = params.tgId;
    this.prof = params.prof;
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
    return this;
  }

  /**
   * Загрузка чара в память
   * @param {Number} charId идентификатор чара
   * @return {Promise}
   */
  static loading(charId) {
    // @todo fast hack
    return new Player(global.arena.players[charId]);
  }

  /**
   * Функция вернет обьект состояния Player
   * @return {Object} {id,nick,prof,hp}
   */
  getStatus() {
    return {
      id: this.id,
      nick: this.nick,
      prof: this.prof,
      hp: this.stats.val('hp'),
    };
  }

  /**
   * Функция вернет обьект состояния Player для отображения команде
   * @return {Object} {id,nick,hp}
   */
  getFullStatus() {
    return {
      id: this.id,
      nick: this.nick,
      prof: this.prof,
      hp: this.stats.val('hp'),
      mp: this.stats.val('mp'),
    };
  }

  /**
   * Нотификация через сокет
   * @param {Object} data обьект для отправки пользователю
   */
  // eslint-disable-next-line class-methods-use-this
  notify(data) {
    channelHelper.broadcast(`Союзники:${data.allies}\n\nВраги:${data.enemies}`,
      this.tgId);
  }
}

module.exports = Player;
