const arena = require('./index');
const StatsService = require('./StatsService');
const FlagsConstructors = require('./Constuructors/FlagsConstructor');
const channelHelper = require('../helpers/channelHelper');
/**
 * PlayerService
 * @description Обьект игрока внутри боя ! Это не Character!
 * @module Service/Player
 */
global.arena.players = {};

// @todo нужно создать отдельный метод, для автоматического сложения всех харок
// аналогично парсеру.

/**
 * Обьект игрока со всеми плюшками
 */
class Player {
  /**
   * Конструктор обьекта игрока внутри игры
   * @param {Object} params параметры игрока из базы
   */
  constructor(params) {
    this.nick = params.nickname;
    this.id = params.id;
    this.prof = params.prof;
    this.stats = new StatsService(params.def);
    this.flags = new FlagsConstructors();
    // @todo закладка для вычисляемых статов
    this.modifiers = params.modifiers || { magics: {}, castChance: 0 }; // Обьект
    // модификаторов
    this.resists = params.resists || {}; // Обьект резистов
    this.skills = params.skills || {}; // Обькт доступных скилов
    this.magics = params.mag || {}; // обьект изученых магий
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
    return new Player(arena.players[charId]);
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
  notify(data) {
    const pack = { event: 'startGame', payload: data };
    // eslint-disable-next-line no-undef
    channelHelper.broadcast(arena.players[this.id].socketId, 'GameEvent', pack);
  }
}

module.exports = Player;
