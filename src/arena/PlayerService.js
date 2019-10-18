const floatNumber = require('./floatNumber');
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
    this.stats = new Stats(params.def);
    this.flags = new Flags();
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
    sails.sockets.broadcast(arena.players[this.id].socketId, 'GameEvent', pack);
  }
}

/**
 * Класс для хранения stats
 */
class Stats {
  /**
   * Конструктор класса stats
   * @param {Object} obj обьект параметров
   */
  constructor(obj) {
    // дефольные параметры
    // балванка
    this.inRound = {};
    // хранение всех статов тут
    this.defStat = obj || {};
    // собранные в результате раундов exp/gold ( + данные для статист)
    this.collect = ({ exp: 0, gold: 0 });
    this.refresh();
    return this;
  }

  /**
   * Функция изменения атрибута
   * @param {String} type тип изменения up/down
   * @param {String} atr изменяемый атрибут atk/hark.str/def
   * @param {floatNumber} val значение на которое будет изменено
   * изменение может происходить только внутри inRound
   */
  mode(type, atr, val) {
    let a = this.inRound[atr];
    if (_.isUndefined(a)) {
      // eslint-disable-next-line no-console
      console.error('mode atr error', atr);
      this.inRound[atr] = 0;
    }
    if (_.isObject(a)) {
      a = this.inRound[atr].max;
    }
    switch (type) {
      case 'up':
        this.inRound[atr] = floatNumber(a + val);
        break;
      case 'down':
        this.inRound[atr] = floatNumber(a - val);
        break;
      case 'set':
        if ('atr' === 'hit') {
          a = floatNumber(a * val);
        } else {
          a = floatNumber(val);
        }
        break;
      default:
        // eslint-disable-next-line no-console
        console.error('Stats mode type error', type);
        throw new Error({
          message: 'stat mode fail', type: 'engine',
        });
    }
    // eslint-disable-next-line no-console
    console.log('new stat:', this.inRound[atr], 'atr', atr, 'val', val);
  }

  /**
   * Функция обнуления состояние inRound Object
   */
  refresh() {
    const oldData = { ...this.inRound }; // ссылаемся на внешний обьект
    if (oldData.exp) {
      this.collect.exp += +oldData.exp;
    }
    this.inRound = { ...this.defStat };
    // выставляем ману и хп на начало раунда
    this.inRound.hp = oldData.hp || this.defStat.maxHp; // @todo hardcord
    this.inRound.mp = oldData.mp || this.defStat.maxMp; // @todo hardcord
    this.inRound.exp = 0; // кол-во Exp на начало раунда
    this.inRound.def = 0; // кол-во дефа на начало
  }

  /**
   * Функция возвращающее значение атрибута
   * @param {String} atr str/atk/prt/dex
   * @return {floatNumber}
   */
  val(atr) {
    const a = this.inRound[atr];
    if (_.isNumber(a)) {
      return floatNumber(a);
    }
    return a;
  }

  /**
   * Добавление голда игроку
   * @param {Number} n кол-во gold
   */
  addGold(n) {
    n = n || 0;
    this.collect.gold += +n;
  }
}

/**
 * Класс флагов
 */
class Flags {
  /**
   * Конструктор обьект флагов
   */
  constructor() {
    this.isProtected = [];
    this.isGlitched = {};
    this.isSilenced = [];
    this.isDead = '';
    this.isHealed = [];
    this.isHited = [];
    return this;
  }

  /**
   * Обнуление флагов
   */
  refresh() {
    this.isProtected = [];
    this.isGlitched = {};
    this.isSilenced = [];
    this.isDead = '';
    this.isHealed = [];
    this.isHited = [];
  }
}

module.exports = Player;
